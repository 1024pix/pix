import dotenv from 'dotenv';
dotenv.config();
import perf_hooks from 'perf_hooks';

const { performance } = perf_hooks;

import { logger } from '../lib/infrastructure/logger.js';
import { cache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { knex, disconnect } from '../db/knex-database-connection.js';

const doSomething = async ({ throwError }) => {
  if (throwError) {
    throw new Error('An error occurred');
  }
  const data = await knex.select('id').from('users').first();
  return data;
};

const isLaunchedFromCommandLine = require.main === module;

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
