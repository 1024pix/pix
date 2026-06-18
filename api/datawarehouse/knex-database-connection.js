import { DatabaseConnection } from '../db/database-connection.js';
import { databaseConnections } from '../db/database-connections.js';
import { config } from '../src/shared/config.js';
import knexConfigs from './knexfile.js';

const databaseConnection = new DatabaseConnection(knexConfigs[config.environment]);

databaseConnections.addConnection(databaseConnection);

export const knex = databaseConnection.knex;
