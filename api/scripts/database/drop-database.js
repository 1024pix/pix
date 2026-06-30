import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { DatabaseConnection } from '../../db/database-connection.js';
import { config } from '../../src/shared/config.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

function isPlatformScalingo() {
  return Boolean(process.env.CONTAINER);
}

function preventDatabaseDropAsItCannotBeCreatedAgain() {
  if (isPlatformScalingo()) {
    logger.error('Database will not be dropped, as it would require to recreate the addon');
    process.exitCode = 1;
  }
}

preventDatabaseDropAsItCannotBeCreatedAgain();

const { environment } = config;

const commandLineArguments = yargs(hideBin(process.argv))
  .option('name', {
    description: 'Name of the database',
    type: 'text',
    demandOption: true,
  })
  .help().argv;

const knexConfigs = (await import(`../../${commandLineArguments.name}/knexfile.js`)).default;
await DatabaseConnection.dropDatabaseFromConfig(knexConfigs[environment], {
  withForce: process.env.FORCE_DROP_DATABASE === 'true',
});
