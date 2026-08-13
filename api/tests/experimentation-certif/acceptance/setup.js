import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { disconnect as disconnectKnex } from '../../../db/knex-database-connection.js';
import { createServer } from '../../../server.js';
import { databaseBuilder } from '../../tooling/databases.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export let server;

export const mochaHooks = {
  async beforeAll() {
    await databaseBuilder.clean();
    const fixtureFiles = await findFixtures(currentDir);
    const firstFixture = fixtureFiles.find((file) => file.includes('common/learning-content.fixture.js'));

    const remainingFixtures = fixtureFiles.filter((file) => file !== firstFixture);

    for (const file of [firstFixture, ...remainingFixtures]) {
      const module = await import(pathToFileURL(file).href);

      if (typeof module.fixture !== 'function') {
        throw new Error(`Fixture ${file} does not export fixture()`);
      }

      module.fixture({ databaseBuilder });
    }

    await databaseBuilder.commit();
    server = await createServer();
  },

  async afterAll() {
    await disconnectKnex();
  },
};

async function findFixtures(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const fixtures = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      fixtures.push(...(await findFixtures(fullPath)));
    } else if (entry.isFile() && entry.name.includes('.fixture.')) {
      fixtures.push(fullPath);
    }
  }

  return fixtures;
}
