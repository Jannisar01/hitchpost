// Fail if any tracked text file starts with a UTF-8 byte-order mark.
// Windows PowerShell 5.1 adds one when it writes UTF-8, and strict parsers (pnpm's CI setup) reject it.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const withBom = files.filter((f) => {
  if (/\.(jpe?g|png|gif|ico|webp|pdf)$/i.test(f)) return false;
  const head = readFileSync(f).subarray(0, 3);
  return head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf;
});
if (withBom.length) {
  console.error(
    `Byte-order mark at the start of:\n${withBom.join("\n")}\nSave these as UTF-8 without BOM.`,
  );
  process.exit(1);
}
console.log(`No byte-order marks in ${files.length} tracked files.`);
