import { databaseConnectionRegistry } from '../db/database-connection-registry.js';

const databaseConnection = databaseConnectionRegistry.get('datawarehouse');
const { knex } = databaseConnection;

export { databaseConnection, knex };
