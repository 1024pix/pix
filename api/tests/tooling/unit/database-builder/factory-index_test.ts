import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

import { expect } from 'chai';

import { factory } from '../../../../db/database-builder/factory/index.ts';

const factoryDirectory = join(import.meta.dirname, '../../../../db/database-builder/factory');
const aggregatorFiles = ['index.js', 'index.ts', 'builders.ts'];
const builderFilePattern = /\.(js|ts)$/;

const listBuilderFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listBuilderFiles(path)));
    else if (builderFilePattern.test(entry.name) && !aggregatorFiles.includes(entry.name)) files.push(path);
  }
  return files;
};

const collectExposedValues = (value: unknown, exposed = new Set<unknown>()): Set<unknown> => {
  if (value === null || value === undefined) return exposed;
  exposed.add(value);
  if (typeof value === 'object') {
    for (const nested of Object.values(value)) collectExposedValues(nested, exposed);
  }
  return exposed;
};

describe('Unit | Tooling | DatabaseBuilder | factory index', function () {
  it('exposes every export of every builder file', async function () {
    // given
    const exposed = collectExposedValues(factory);
    const builderFiles = await listBuilderFiles(factoryDirectory);

    // when / then
    for (const file of builderFiles) {
      const module = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
      for (const [exportName, exportedValue] of Object.entries(module)) {
        const location = relative(factoryDirectory, file);
        expect(
          exposed.has(exportedValue),
          `${exportName} from ${location} is not exposed by factory/index.ts`,
        ).to.equal(true);
      }
    }
  });
});
