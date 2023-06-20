import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function importNamedExportsFromDir(path, ignoredFileNames = []) {
  const imports = {};
  const exportsLocations = {};
  const files = await readdir(path);
  for (const file of files) {
    if (!file.endsWith('.js') || ignoredFileNames.includes(file)) {
      continue;
    }

    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const module = await import(join(path, file));
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
