import { loadEnvFileIfExists } from '../src/shared/load-env-file-if-exists.js';
import { buildPostgresEnvironment, setConnectionString } from './utils/build-postgres-environment.js';

loadEnvFileIfExists();

const baseConfiguration = {
  name: 'live',
  migrationsDirectory: './migrations/',
  seedsDirectory: './seeds/',
  connection: {
    connectionString: process.env.DATABASE_URL,
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
  test: setConnectionString(process.env.TEST_DATABASE_URL, buildPostgresEnvironment(baseConfiguration)),
  production: buildPostgresEnvironment(baseConfiguration),
};

export const knexConfigWithPgBouncer = {
  ...defaultKnexConfig,
  production: setConnectionString(
    process.env.PGBOUNCER_DATABASE_URL ?? process.env.DATABASE_URL,
    buildPostgresEnvironment(baseConfiguration),
  ),
};

export default defaultKnexConfig;
