import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { executeScript } from '../tooling/tooling.js';

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
      await executeScript({ processArgvs: process.argv, scriptFn: main });
    } catch (error) {
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { hideSkills };
