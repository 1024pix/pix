import { config } from '../src/shared/config.js';
import { buildPostgresEnvironment, setConnectionString } from './utils/build-postgres-environment.js';

const baseConfiguration = {
  name: 'live',
  migrationsDirectory: './migrations/',
  seedsDirectory: './seeds/',
  connection: {
    connectionString: config.database.liveUrl,
    application_name: config.infra.hostname,
    statement_timeout: config.database.connection.statementTimeout,
    query_timeout: config.database.connection.queryTimeout,
    idle_in_transaction_session_timeout: config.database.connection.idleInTransactionSessionTimeout,
    connectionTimeoutMillis: config.database.connection.connectionTimeoutMillis,
  },
  pool: config.database.pool,
};

const defaultKnexConfig = {
  development: buildPostgresEnvironment(baseConfiguration),
  test: buildPostgresEnvironment(baseConfiguration),
  production: buildPostgresEnvironment(baseConfiguration),
};

export const knexConfigWithPgBouncer = {
  ...defaultKnexConfig,
  production: setConnectionString(
    config.database.pgbouncerUrl ?? config.database.liveUrl,
    buildPostgresEnvironment(baseConfiguration),
  ),
};

export default defaultKnexConfig;
