import 'dotenv/config';

import perf_hooks from 'node:perf_hooks';
import * as url from 'node:url';

const { performance } = perf_hooks;

import { disconnect, knex } from '../db/knex-database-connection.js';
import { learningContentCache as cache } from '../src/shared/infrastructure/caches/learning-content-cache.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

const doSomething = async ({ throwError }) => {
  if (throwError) {
    throw new Error('An error occurred');
  }
  const data = await knex.select('id').from('users').first();
  return data;
};

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
const __filename = modulePath;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await doSomething({ throwError: false });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
    }
  }
})();

export { doSomething };
