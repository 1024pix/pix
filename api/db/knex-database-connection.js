import { databaseConnectionRegistry } from './database-connection-registry.js';

const databaseConnection = databaseConnectionRegistry.get('api');
const { knex } = databaseConnection;

export { databaseConnection, knex };
