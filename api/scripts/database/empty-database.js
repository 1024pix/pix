import { disconnect, emptyAllTables } from '../../db/knex-database-connection.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../lib/infrastructure/monitoring-tools.js';

const main = async () => {
  logInfoWithCorrelationIds('Emptying all tables...');
  await emptyAllTables();
  logInfoWithCorrelationIds('Done!');
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
