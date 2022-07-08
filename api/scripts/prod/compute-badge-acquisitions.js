require('dotenv').config();
const { performance } = require('perf_hooks');
const logger = require('../../lib/infrastructure/logger');
const { disconnect } = require('../../db/knex-database-connection');

async function main() {
  const startTime = performance.now();
  logger.info(`Script compute badge acquisitions has started`);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

const isLaunchedFromCommandLine = require.main === module;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = {};
