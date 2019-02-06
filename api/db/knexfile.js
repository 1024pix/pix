require('dotenv').config({ path: '../.env' });

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

function localSQLiteEnv(databaseFileName) {
  return {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}/${databaseFileName}`,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
    },
    seeds: {
      directory: `${__dirname}/seeds`,
    },
    useNullAsDefault: true,
  };
}

module.exports = {

  development: process.env.DATABASE_URL ? localPostgresEnv(process.env.DATABASE_URL) : localSQLiteEnv('dev.sqlite3'),

  test: process.env.TEST_DATABASE_URL ? localPostgresEnv(process.env.TEST_DATABASE_URL) : localSQLiteEnv('test.sqlite3'),

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
