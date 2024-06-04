import { disconnect, emptyAllTables } from '../../db/knex-database-connection.js';
import { logErrorWithCorrelationIds } from '../../lib/infrastructure/monitoring-tools.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const main = async () => {
  logger.info('Emptying all tables...');
  await emptyAllTables();
  logger.info('Done!');
};

(async () => {
  try {
    await main();
  } catch (error) {
    logErrorWithCorrelationIds(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
