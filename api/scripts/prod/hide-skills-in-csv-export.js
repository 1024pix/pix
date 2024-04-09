import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';

async function hideSkills() {
  await knex('organizations').where('showSkills', true).update({ showSkills: false });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  await hideSkills();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { hideSkills };
