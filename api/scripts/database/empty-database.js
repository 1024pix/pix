import { emptyAllTables, disconnect } from '../../db/knex-database-connection';
import logger from '../../lib/infrastructure/logger';

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
