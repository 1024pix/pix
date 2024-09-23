import 'dotenv/config';

import * as url from 'node:url';

import { knex } from '../db/knex-database-connection.js';
import { executeScript } from './tooling/tooling.js';

const doSomething = async (someArgStr, { throwError }) => {
  if (throwError) {
    throw new Error(`An error occurred and argument is ${someArgStr}`);
  }
  const data = await knex.select('id').from('users').first();
  return data;
};

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    const fnWithArgs = doSomething.bind(this, 'someArg', { throwError: false });
    await executeScript({ processArgvs: process.argv, scriptFn: fnWithArgs });
  }
})();

export { doSomething };
