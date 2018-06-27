
const commonPgProperties = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 1,
    max: (parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, '10') || 4),
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  },
  ssl: ('true' === process.env.DATABASE_SSL_ENABLED)
};

const commonSqliteProperties = {
  client: 'sqlite3',
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  },
  useNullAsDefault: true
};

const config = {

  development: Object.assign({}, commonPgProperties),

  integration: Object.assign({}, commonSqliteProperties, {
    connection: { filename: `${__dirname}/integration.sqlite3` },
  }),

  staging: Object.assign({}, commonPgProperties),

  production: Object.assign({}, commonPgProperties),

  test_with_sqlite: Object.assign({}, commonSqliteProperties, {
    connection: { filename: `${__dirname}/test.sqlite3` }
  }),

  test_with_pg: Object.assign({}, commonPgProperties),
};

if (process.env.USE_PG) {
  config.test = config.test_with_pg;
} else {
  config.test = config.test_with_sqlite;
}

module.exports = config;
