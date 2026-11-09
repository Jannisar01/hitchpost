// Consistency check for docs/sad. Usage: pnpm docs:check  (exit 1 on any problem)
// Checks: document headers, every referenced ID is defined, links and anchors resolve,
// values that restate a normative parameter match the register in 00 §10.1, and
// phase labels for key capabilities match the phase map in 00 §10.2.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const SAD = "docs/sad";
const docs = readdirSync(SAD).filter((f) => /^\d{2}-.+\.md$/.test(f));
const extra = ["README.md", "docs/journey/README.md", "docs/bugs.md", "docs/sad/README.md"];
const files = docs.map((f) => join(SAD, f)).concat(extra.filter(existsSync));
const read = (f) => readFileSync(f, "utf8").replace(/^﻿/, "");
const problems = [];
const fail = (f, line, msg) => problems.push(`${f}${line ? `:${line}` : ""}  ${msg}`);

// Lines that describe history rather than current state are exempt from value and phase checks.
const bodyLines = (text) => {
  const lines = text.split("\n");
  const end = lines.findIndex((l) => /^## Revision history/.test(l));
  return (end < 0 ? lines : lines.slice(0, end)).map((l, i) => ({ l, n: i + 1 }));
};

// 1. Headers.
for (const f of docs) {
  const t = read(join(SAD, f));
  const id = f.slice(0, 2);
  if (!t.startsWith(`# HP-SAD-${id} · `)) fail(f, 1, `title must start "# HP-SAD-${id} · "`);
  if (!new RegExp(String.raw`\|\s*Document ID\s*\|\s*HP-SAD-${id}\s*\|`).test(t))
    fail(f, 0, "missing document control table");
  if (!t.includes("## Revision history")) fail(f, 0, "missing revision history");
}

// 2. IDs: everything referenced must be defined somewhere (table first column, heading or bold list item).
const ID = String.raw`(FR-[A-Z]+-\d{2}|NFR-[A-Z0-9]+-\d{2}|UC-\d{2}|A-\d{2}|R-\d{2}|T-\d{2}|D-\d{2}|G-\d|BR-\d{2}|QAS-\d{2}|WP-\d\.\d+|M-\d{2}|DQ-\d{2}|E-\d{2}|ALT-[A-D]|P-\d{2}|TC-\d{2,3}|CR-\d|UP-\d|UT-\d{1,2}|AR-\d|SP-\d|TO-\d|NR-\d)`;
const defRes = [
  new RegExp(String.raw`^\|\s*\**\`?${ID}\`?\**[\s|.:(]`),
  new RegExp(String.raw`^#{2,4}\s+(?:\d+(?:\.\d+)*\.?\s+)?\**${ID}\b`),
  new RegExp(String.raw`^- \*\*${ID}`),
];
const defined = new Set();
const refs = [];
for (const f of files)
  read(f)
    .split("\n")
    .forEach((line, i) => {
      for (const re of defRes) {
        const m = line.match(re);
        if (m) defined.add(m[1]);
      }
      for (const m of line.matchAll(new RegExp(String.raw`\b${ID}\b`, "g")))
        refs.push([f, i + 1, m[1]]);
    });
for (const [f, n, id] of refs)
  if (!defined.has(id)) fail(f, n, `${id} is referenced but never defined`);

// 3. Links and anchors (GitHub heading slugs).
const slug = (h) =>
  h
    .replace(/[`*]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/ /g, "-");
const anchorCache = new Map();
const anchors = (p) => {
  if (!anchorCache.has(p))
    anchorCache.set(
      p,
      new Set(
        read(p)
          .split("\n")
          .filter((l) => /^#{1,6} /.test(l))
          .map((l) => slug(l.replace(/^#+ /, ""))),
      ),
    );
  return anchorCache.get(p);
};
for (const f of files)
  read(f)
    .split("\n")
    .forEach((line, i) => {
      for (const m of line.matchAll(/\]\(([^)\s]+?)\)/g)) {
        const [path, anchor] = m[1].split("#");
        if (/^(https?:|mailto:)/.test(path)) continue;
        const target = path ? resolve(dirname(f), path) : resolve(f);
        if (!existsSync(target)) fail(f, i + 1, `broken link ${m[1]}`);
        else if (anchor && target.endsWith(".md") && !anchors(target).has(anchor))
          fail(f, i + 1, `broken anchor ${m[1]}`);
      }
    });

// 4. Values. The canonical value is read from the register; the keywords say where it gets restated.
const register = new Map();
for (const line of read(join(SAD, "00-document-control.md")).split("\n")) {
  const m = line.match(/^\|\s*(P-\d{2})\s*\|[^|]*\|\s*([^|]+)\|/);
  if (m) register.set(m[1], m[2]);
}
const watch = [
  ["P-01", /offer hold|holds? (the|a) slot for/i, /(\d+) ?min/],
  ["P-03", /manual approval wait|shop.{0,20}(waits|has) \d+ ?min/i, /(\d+) ?min/],
  ["P-04", /booking deadline/i, /(\d+) ?min/],
  ["P-06", /search window/i, /(\d+) days/],
  ["P-08", /rate limit/i, /(\d+) (requests|req)/],
  ["P-11", /(expired|declined) offers?.{0,40}(kept|retained|deleted|purged)/i, /(\d+) days/],
  ["P-15", /backups? (expire|are kept|retention)/i, /(\d+) days/],
  ["P-16", /critical (cve|vulnerab)/i, /(\d+) ?(hours|h)\b/],
  ["P-18", /supported for|support window/i, /(\d+) months/],
];
for (const [pid, where, unit] of watch) {
  const canonical = register.get(pid)?.match(unit)?.[1];
  if (!canonical) {
    fail(
      "00-document-control.md",
      0,
      `${pid} missing from the register or has no value matching ${unit}`,
    );
    continue;
  }
  for (const f of files) {
    if (f.endsWith("00-document-control.md")) continue;
    for (const { l, n } of bodyLines(read(f))) {
      if (!where.test(l)) continue;
      // A line may state several values (e.g. hold and wait); it is wrong only if none of them is the canonical one.
      const stated = [...l.matchAll(new RegExp(unit, "g"))].map((m) => m[1]);
      if (stated.length && !stated.includes(canonical))
        fail(
          f,
          n,
          `${pid} says ${canonical}, this line says ${stated.join("/")}: cite ${pid} instead`,
        );
    }
  }
}

// 5. Phases for capabilities that have drifted before.
const phaseOf = [
  // Shop time zones are Phase 6; showing a person times in their own zone (app, Phase 4) is separate.
  [
    /(shop|business)('s)? (local )?time zones?|IANA zone per (shop|business)|local slot grid|ADR 0018/i,
    "6",
  ],
  [/signed (agent )?cards?|card signing/i, "6"],
  [/staging/i, "6"],
  [/slot_claims|exclusion constraint/i, "6"],
  [/calendar write/i, "4"],
  [/barber dashboard/i, "4"],
];
for (const f of files)
  for (const { l, n } of bodyLines(read(f)))
    for (const [what, phase] of phaseOf) {
      if (!what.test(l)) continue;
      const phases = [...l.matchAll(/Phase (\d)/g)].map((m) => m[1]);
      if (phases.length && !phases.includes(phase))
        fail(f, n, `capability placed in Phase ${phases.join("/")}, phase map says ${phase}`);
    }

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s) in docs/sad`);
  process.exit(1);
}
console.log(
  `docs/sad consistent: ${docs.length} documents, ${defined.size} IDs, links, values and phases checked`,
);
