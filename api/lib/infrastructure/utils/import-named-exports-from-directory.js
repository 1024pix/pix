import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function importNamedExportsFromDirectory(path, ignoredFileNames = []) {
  const imports = {};
  const exportsLocations = {};
  const files = await readdir(path);
  for (const file of files) {
    if (!file.endsWith('.js') || ignoredFileNames.includes(file)) {
      continue;
    }

    const fileURL = pathToFileURL(join(path, file));
    const module = await import(fileURL);
    const namedExports = Object.entries(module);

    for (const [exportName, exportedValue] of namedExports) {
      if (exportName === 'default') {
        continue;
      }
      if (imports[exportName]) {
        throw new Error(`Duplicate export name ${exportName} : ${exportsLocations[exportName]} and ${file}`);
      }
      imports[exportName] = exportedValue;
      exportsLocations[exportName] = file;
    }
  }
  return imports;
}
