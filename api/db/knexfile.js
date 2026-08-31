import { config } from '../src/shared/config.js';
import { buildPostgresEnvironment, setConnectionString } from './utils/build-postgres-environment.js';

// TODO: Migrate other variables into config
const baseConfiguration = {
  name: 'live',
  migrationsDirectory: './migrations/',
  seedsDirectory: './seeds/',
  connection: {
    connectionString: config.database.liveUrl,
    application_name: process.env.HOSTNAME ?? 'pix-api',
    statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT_MS, 10) || undefined,
    query_timeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT_MS, 10) || undefined,
    idle_in_transaction_session_timeout:
      parseInt(process.env.DATABASE_IDLE_IN_TRANSACTION_SESSION_TIMEOUT_MS, 10) || undefined,
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 10) || undefined,
  },
  pool: {
    min: parseInt(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE, 10),
    max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, 10),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS, 10) || 10_000,
  },
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
