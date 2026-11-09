// Rename the working codename everywhere (ADR 0006).
// Usage: node scripts/rename.mjs "NewName"
// shortcut: assumes a single-word name, since it is also used in package names; slugify if the final name has spaces.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const next = process.argv[2];
if (!next || !/^[A-Za-z][A-Za-z0-9]*$/.test(next)) {
  console.error('Usage: node scripts/rename.mjs "NewName" (one word, letters and digits)');
  process.exit(1);
}

const OLD = ["hitch", "post"].join(""); // split so this file never renames itself
const pattern = new RegExp(OLD, "gi");
const lower = next.toLowerCase();
const capital = lower[0].toUpperCase() + lower.slice(1);
const swap = (m) =>
  m === m.toUpperCase() ? next.toUpperCase() : m[0] === m[0].toUpperCase() ? capital : lower;

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
let changed = 0;
for (const file of files) {
  if (/\.(jpg|jpeg|png|gif|ico|webp|pdf)$/i.test(file)) continue;
  const text = readFileSync(file, "utf8");
  const updated = text.replace(pattern, swap);
  if (updated !== text) {
    writeFileSync(file, updated);
    changed++;
  }
}
console.log(`Renamed in ${changed} files. Run pnpm install to refresh the lockfile.`);
