import { emptyAllTables, disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';

async function main(): Promise<void> {
  logger.info('Emptying all tables...');

  try {
    await emptyAllTables();
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
    logger.info('Done!');
  }
}

await main();
