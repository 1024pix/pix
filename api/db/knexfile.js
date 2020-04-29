if (process.env.NODE_ENV === 'cypress') {
  require('dotenv').config({ path: `${__dirname}/../.env.cypress` });
} else {
  require('dotenv').config({ path: `${__dirname}/../.env` });
}

function localPostgresEnv(databaseUrl) {
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
  };
}

module.exports = {

  development: localPostgresEnv(process.env.DATABASE_URL),

  test: localPostgresEnv(process.env.TEST_DATABASE_URL),

  cypress: localPostgresEnv(process.env.DATABASE_URL),

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
  },
};
