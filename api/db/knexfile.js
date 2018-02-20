module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}/dev.sqlite3`
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    useNullAsDefault: true
  },

  integration: {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}/integration.sqlite3`
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    useNullAsDefault: true
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 10,
      max: 100
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    ssl: true
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}/test.sqlite3`
    },
    migrations: {
      directory: `${__dirname}/migrations`
    },
    seeds: {
      directory: `${__dirname}/seeds`
    },
    useNullAsDefault: true
  }

};
