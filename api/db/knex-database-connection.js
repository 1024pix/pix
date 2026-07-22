import { config } from '../src/shared/config.js';
import { DatabaseConnection } from './database-connection.js';
import { databaseConnections } from './database-connections.js';
import { knexConfigWithPgBouncer } from './knexfile.js';

const { environment } = config;
const databaseConnection = new DatabaseConnection(knexConfigWithPgBouncer[environment]);
const configuredLiveKnex = databaseConnection.knex;

databaseConnections.addConnection(databaseConnection);

async function disconnect() {
  return databaseConnection.disconnect();
}

export { databaseConnection, disconnect, configuredLiveKnex as knex };
