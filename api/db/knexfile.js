require('dotenv').config({ path: '../.env' });

function developementEnv() {
  if (process.env.DATABASE_URL) {

    return {
      client: 'postgresql',
      connection: process.env.DATABASE_URL,
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
  } else {

    return {
      client: 'sqlite3',
      connection: {
        filename: `${__dirname}/dev.sqlite3`,
      },
      migrations: {
        directory: './migrations',
      },
      seeds: {
        directory: './seeds',
      },
      useNullAsDefault: true,
    };
  }
}

module.exports = {

  development: developementEnv(),

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

  test: {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}/test.sqlite3`,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
    },
    seeds: {
      directory: `${__dirname}/seeds`,
    },
    useNullAsDefault: true,
  },

};

