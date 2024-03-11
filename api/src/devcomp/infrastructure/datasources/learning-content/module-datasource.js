import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { LearningContentResourceNotFound } from '../../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';

const referential = await importModules();

const moduleDatasource = {
  getBySlug: async (slug) => {
    const foundModule = referential.modules.find((module) => module.slug === slug);

    if (foundModule === undefined) {
      throw new LearningContentResourceNotFound();
    }

    return foundModule;
  },
  list: async () => {
    return referential.modules;
  },
};

async function importModules() {
  const imports = { modules: [] };

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const path = join(__dirname, './modules');
  const files = await readdir(path, { withFileTypes: true });

  for (const file of files) {
    const fileURL = pathToFileURL(join(path, file.name));
    const module = await import(fileURL, { assert: { type: 'json' } });
    imports.modules.push(module.default);
  }

  return imports;
}

export default moduleDatasource;
