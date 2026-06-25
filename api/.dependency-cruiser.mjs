import { glob, readFile } from 'node:fs/promises';

import { buildForbiddenRules } from './tests/tooling/dependency-cruiser-generator.js';

const contexts = [];

for await (const file of glob('src/**/dependencies.json')) {
  const dependencies = await readFile(file, { encoding: 'utf-8' });
  contexts.push(JSON.parse(dependencies));
}

export default {
  forbidden: [
    ...buildForbiddenRules(contexts),
    {
      name: 'do-not-import-migrations',
      severity: 'error',
      from: { path: '^(.*)' },
      to: { path: '^db/migrations/(.*)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
  },
};
