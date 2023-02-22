const dotenv = require('dotenv');
dotenv.config();
const { performance } = require('perf_hooks');
const logger = require('../lib/infrastructure/logger');
const cache = require('../lib/infrastructure/caches/learning-content-cache');
const { knex, disconnect } = require('../db/knex-database-connection');

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

module.exports = { doSomething };
