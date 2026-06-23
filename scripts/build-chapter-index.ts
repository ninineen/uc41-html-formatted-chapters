import * as fs from "fs";
import * as path from "path";

const chaptersDir = path.resolve(__dirname, "../chapters");
const outDir      = path.resolve(__dirname, "../build/chapters");
const outFile     = path.join(outDir, "index.json");

const files = fs.readdirSync(chaptersDir)
  .filter(f => f.endsWith(".formatted.html"))
  .sort();

const entries = files.map(f => ({
  label: f.replace(".formatted.html", "").replace(/^ch/, "ch ") + " (formatted)",
  path:  `chapters/${f}`,
}));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(entries, null, 2), "utf8");
process.stdout.write(`Written: ${outFile} (${entries.length} chapter(s))\n`);
