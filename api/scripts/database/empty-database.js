import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { databaseConnectionRegistry } from '../../db/database-connection-registry.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const commandLineArguments = yargs(hideBin(process.argv))
  .option('name', {
    description: 'Name of the database',
    type: 'text',
    demandOption: true,
  })
  .help().argv;
const databaseToEmpty = commandLineArguments.name;
const connectionName = databaseToEmpty === 'db' ? 'api' : databaseToEmpty;
try {
  const databaseConnection = databaseConnectionRegistry.get(connectionName);
  logger.info(`Emptying all tables of database ${databaseToEmpty}...`);
  await databaseConnection.emptyAllTables();
  logger.info('Done!');
} catch (error) {
  logger.error(error);
  process.exitCode = 1;
} finally {
  await databaseConnectionRegistry.disconnect();
}
