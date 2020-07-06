require('dotenv').config({ path: `${__dirname}/../.env` });

function localPostgresEnv(databaseUrl, knexAsyncStacktraceEnabled) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: 1,
      max: 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    asyncStackTraces: (knexAsyncStacktraceEnabled !== 'false'),
  };
}

module.exports = {

  development: localPostgresEnv(
    process.env.DATABASE_URL,
    process.env.KNEX_ASYNC_STACKTRACE_ENABLED
  ),

  test: localPostgresEnv(
    process.env.TEST_DATABASE_URL,
    process.env.KNEX_ASYNC_STACKTRACE_ENABLED
  ),

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: (parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, 10) || 4),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    asyncStackTraces: (process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false'),
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: (parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, 10) || 4),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    ssl: ('true' === process.env.DATABASE_SSL_ENABLED),
    asyncStackTraces: (process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false'),
  },
};
