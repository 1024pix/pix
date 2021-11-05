const knexDatabaseConnection = require('../../db/knex-database-connection');
const logger = require('../../lib/infrastructure/logger');

logger.info('Emptying all tables...');
knexDatabaseConnection.emptyAllTables().then(() => {
  logger.info('Done!');
  process.exit(0);
});
