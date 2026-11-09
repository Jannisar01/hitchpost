// Bind docs/sad into one PDF: cover, contents, every document in order, rendered Mermaid diagrams.
// Usage: pnpm docs:pdf   (needs Google Chrome or Microsoft Edge installed; Mermaid loads from a CDN)
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { marked } from "marked";

const SAD = resolve("docs/sad");
const OUT = join(SAD, "Hitchpost-System-Analysis-and-Design.pdf");
const docs = readdirSync(SAD)
  .filter((f) => /^\d{2}-.+\.md$/.test(f))
  .sort();

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Mermaid blocks become <pre class="mermaid"> so the browser renders them.
marked.use({
  renderer: {
    code({ text, lang }) {
      const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return lang === "mermaid"
        ? `<pre class="mermaid">${esc}</pre>`
        : `<pre><code>${esc}</code></pre>`;
    },
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return `<h${depth} id="${this.options.docId}-${slug(text.replace(/<[^>]+>/g, ""))}">${text}</h${depth}>`;
    },
  },
});

const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
const toc = [];
const bodies = docs.map((file) => {
  const docId = file.slice(0, 2);
  const md = readFileSync(join(SAD, file), "utf8").replace(/^\uFEFF/, "");
  const title = md.split("\n")[0].replace(/^#\s*/, "");
  toc.push({ docId, title });
  let html = marked.parse(md, { docId });
  // Links between documents become links inside the PDF.
  html = html.replace(/href="(\d{2})-[a-z0-9-]+\.md(?:#([^"]*))?"/g, (_m, n, a) =>
    a ? `href="#${n}-${a}"` : `href="#doc-${n}"`,
  );
  // Links to files outside the package point at the repository.
  html = html.replace(
    /href="(?!#|https?:)([^"]+)"/g,
    (_m, p) => `href="https://github.com/Jannisar01/hitchpost/blob/main/docs/sad/${p}"`,
  );
  return `<section class="doc" id="doc-${docId}">${html}</section>`;
});

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Hitchpost: System Analysis and Design</title>
<style>
  @page { size: A4; margin: 20mm 18mm 22mm; @bottom-center { content: "Hitchpost SA&D  ·  " counter(page); font: 9pt system-ui; color: #666; } }
  @page :first { @bottom-center { content: none; } }
  body { font: 10.5pt/1.5 "Segoe UI", system-ui, sans-serif; color: #1b1b1b; }
  h1 { font-size: 20pt; border-bottom: 2px solid #8a5a2b; padding-bottom: 4pt; color: #3d2a17; }
  h2 { font-size: 14pt; margin-top: 18pt; color: #3d2a17; break-after: avoid; }
  h3 { font-size: 11.5pt; break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9pt; break-inside: auto; }
  th, td { border: 1px solid #c9c3bb; padding: 3pt 5pt; text-align: left; vertical-align: top; }
  th { background: #f1ebe3; }
  tr { break-inside: avoid; }
  code { font: 8.8pt Consolas, monospace; background: #f5f2ee; padding: 0 2pt; }
  pre { background: #f5f2ee; padding: 6pt; font-size: 8.5pt; white-space: pre-wrap; break-inside: avoid; }
  pre.mermaid { background: none; text-align: center; }
  a { color: #8a5a2b; text-decoration: none; }
  blockquote { border-left: 3px solid #c9c3bb; margin: 0; padding-left: 10pt; color: #555; }
  .doc { break-before: page; }
  .cover { height: 250mm; display: flex; flex-direction: column; justify-content: center; }
  .cover h1 { font-size: 34pt; border: 0; margin: 0; }
  .cover .sub { font-size: 16pt; color: #8a5a2b; margin: 6pt 0 40pt; }
  .cover dl { display: grid; grid-template-columns: 40mm 1fr; gap: 3pt 0; font-size: 10.5pt; }
  .cover dt { color: #666; }
  .toc { break-before: page; }
  .toc li { margin: 3pt 0; }
</style></head><body>
<div class="cover">
  <h1>Hitchpost</h1>
  <div class="sub">System Analysis and Design</div>
  <dl>
    <dt>Package</dt><dd>HP-SAD, ${docs.length} documents, version 1.0</dd>
    <dt>Status</dt><dd>Baselined for Phase 2</dd>
    <dt>Date</dt><dd>${new Date().toISOString().slice(0, 10)}</dd>
    <dt>Owner</dt><dd>Sanaullah Jannisar, product and engineering lead</dd>
    <dt>Built from</dt><dd>commit ${commit}</dd>
    <dt>Source</dt><dd>Markdown in docs/sad is the source of truth; this PDF is generated from it.</dd>
    <dt>License</dt><dd>MIT</dd>
  </dl>
</div>
<nav class="toc"><h1>Contents</h1><ol style="list-style:none;padding:0">
${toc.map((d) => `<li><a href="#doc-${d.docId}">${d.title}</a></li>`).join("\n")}
</ol></nav>
${bodies.join("\n")}
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
  await mermaid.run({ querySelector: "pre.mermaid" });
  document.body.dataset.ready = "1";
</script>
</body></html>`;

const htmlPath = join(tmpdir(), "hitchpost-sad.html");
writeFileSync(htmlPath, html);

const browsers = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const browser = browsers.find(existsSync);
if (!browser) throw new Error("Install Google Chrome or Microsoft Edge to build the PDF.");

execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--virtual-time-budget=30000",
  `--print-to-pdf=${OUT}`,
  `file:///${htmlPath.replace(/\\/g, "/")}`,
]);
console.log(`Wrote ${OUT}`);
