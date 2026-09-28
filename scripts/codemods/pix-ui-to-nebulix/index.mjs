import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { transform } from "./transform.mjs";

const EXTENSIONS = new Set([".gjs", ".gts"]);
const IGNORED_DIRECTORIES = ["node_modules", "dist"];

async function findFiles(path) {
  if (!(await stat(path)).isDirectory()) return [path];
  const entries = await readdir(path, { recursive: true });
  return entries
    .filter((entry) => EXTENSIONS.has(extname(entry)))
    .filter(
      (entry) =>
        !entry.split("/").some((part) => IGNORED_DIRECTORIES.includes(part)),
    )
    .map((entry) => join(path, entry));
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const paths = args.filter((arg) => arg !== "--dry-run");

if (paths.length === 0) {
  console.error(
    "Usage: node scripts/codemods/pix-ui-to-nebulix/index.mjs <paths...> [--dry-run]",
  );
  process.exitCode = 1;
} else {
  const files = (await Promise.all(paths.map(findFiles))).flat();
  let modifiedFiles = 0;
  let convertedImports = 0;
  let warningCount = 0;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { code, converted, warnings } = transform(source);

    for (const { line, statement } of warnings) {
      console.warn(`⚠️  ${file}:${line} ${statement.trim()}`);
    }
    warningCount += warnings.length;

    if (code !== source) {
      modifiedFiles++;
      convertedImports += converted;
      if (dryRun) console.log(`${file}`);
      else await writeFile(file, code);
    }
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}${modifiedFiles} file(s) modified, ${convertedImports} import(s) converted, ${warningCount} warning(s).`,
  );
}
