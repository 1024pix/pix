import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { DatabaseConnection } from '../../db/database-connection.js';
import { config } from '../../src/shared/config.js';

const { environment } = config;

const commandLineArguments = yargs(hideBin(process.argv))
  .option('name', {
    description: 'Name of the database',
    type: 'text',
    demandOption: true,
  })
  .help().argv;

const knexConfigs = (await import(`../../${commandLineArguments.name}/knexfile.js`)).default;
await DatabaseConnection.createDatabaseFromConfig(knexConfigs[environment]);
