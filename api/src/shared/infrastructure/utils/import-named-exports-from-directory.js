import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function importNamedExportsFromDirectory({ path, ignoredFileNames = [] }) {
  const imports = {};
  const exportsLocations = {};
  const files = await readdir(path, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      continue;
    }

    if (!file.name.endsWith('.js') || ignoredFileNames.includes(file.name)) {
      continue;
    }

    const fileURL = pathToFileURL(join(path, file.name));
    const module = await import(fileURL);
    const namedExports = Object.entries(module);

    for (const [exportName, exportedValue] of namedExports) {
      if (exportName === 'default') {
        continue;
      }
      if (imports[exportName]) {
        throw new Error(`Duplicate export name ${exportName} : ${exportsLocations[exportName]} and ${file.name}`);
      }
      imports[exportName] = exportedValue;
      exportsLocations[exportName] = file.name;
    }
  }
  return imports;
}

export async function importNamedExportFromFile(filepath) {
  const fileURL = pathToFileURL(filepath);
  const module = await import(fileURL);
  const namedExports = Object.entries(module);

  return namedExports
    .filter(([exportName]) => exportName !== 'default')
    .reduce((exports, [exportName, exportedValue]) => {
      exports[exportName] = exportedValue;
      return exports;
    }, {});
}
