const { emptyAllTables, disconnect } = require('../../db/knex-database-connection');
const logger = require('../../lib/infrastructure/logger');

const main = async () => {
  logger.info('Emptying all tables...');
  await emptyAllTables();
  logger.info('Done!');
};

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
