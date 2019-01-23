const _ = require('lodash');

const knexConfigs = require('./knexfile');
const { environment } = require('../lib/settings');

const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

const _clientName = knex.schema.client.config.client;
const _databaseName = knex.client.database();
const _isSQLite = (_clientName === 'sqlite3');

const _dbSpecificQueries = {
  postgresql: {
    listTablesQuery: 'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    truncateTableQuery: 'TRUNCATE TABLE ?? CASCADE;'
  },

  sqlite3: {
    listTablesQuery: 'SELECT name AS table_name FROM sqlite_master WHERE type=\'table\'',
    truncateTableQuery: 'DELETE FROM ??;'
  }
};

async function listAllTableNames() {
  const bindings = _isSQLite ? undefined : [_databaseName];
  const query = _dbSpecificQueries[_clientName].listTablesQuery;

  const resultSet = await knex.raw(query, bindings);

  const rows = _isSQLite ? resultSet : resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTables() {
  const tableNames = await listAllTableNames();
  const tablesToDelete = _.without(tableNames,
    'knex_migrations',
    'knex_migrations_lock',
    'sqlite_sequence'
  );

  const query = _dbSpecificQueries[_clientName].truncateTableQuery;

  for (const tableName of tablesToDelete) {
    await knex.raw(query, [tableName]);
  }
}

module.exports = {
  knex,
  listAllTableNames,
  emptyAllTables,
};
