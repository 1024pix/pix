import { databaseConnectionRegistry } from '../db/database-connection-registry.js';

const databaseConnection = databaseConnectionRegistry.get('datamart');
const { knex } = databaseConnection;

export { databaseConnection, knex };
