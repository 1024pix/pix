import { config } from '../src/shared/config.js';
import { featureToggles } from '../src/shared/infrastructure/feature-toggles/index.js';
import { DatabaseConnection } from './database-connection.js';
import { databaseConnections } from './database-connections.js';
import defaultKnexConfig, { knexConfigWithPgBouncer } from './knexfile.js';

const { environment } = config;
const pooledDatabaseConnection = new DatabaseConnection(knexConfigWithPgBouncer[environment]);

const directDatabaseConnection = new DatabaseConnection(defaultKnexConfig[environment]);

databaseConnections.addConnection(pooledDatabaseConnection);
databaseConnections.addConnection(directDatabaseConnection);

const pooledDbConnectionPercentage = featureToggles.use('pooledDbConnectionPercentage');
let sqlQueryCount = 0;

export function getDb() {
  const db = sqlQueryCount < pooledDbConnectionPercentage.value ? pooledDatabaseConnection : directDatabaseConnection;

  if (sqlQueryCount >= 99) {
    sqlQueryCount = 0;
  } else {
    sqlQueryCount++;
  }

  return db.knex;
}

export const databaseConnection = {
  async emptyAllTables() {
    await directDatabaseConnection.emptyAllTables();
  },
  async disconnect() {
    await directDatabaseConnection.disconnect();
  },
  async prepare() {
    await directDatabaseConnection.prepare();
  },
};
