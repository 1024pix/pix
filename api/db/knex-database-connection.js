/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
const types = require('pg').types;
types.setTypeParser(types.builtins.DATE, (value) => value);

const _ = require('lodash');

const knexConfigs = require('./knexfile');
const { environment } = require('../lib/config');

const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

const _clientName = knex.schema.client.config.client;
const _databaseName = knex.client.database();

const _dbSpecificQueries = {
  postgresql: {
    listTablesQuery: 'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    truncateTableQuery: 'TRUNCATE TABLE ?? CASCADE;'
  },
};

async function listAllTableNames() {
  const bindings = [_databaseName];
  const query = _dbSpecificQueries[_clientName].listTablesQuery;

  const resultSet = await knex.raw(query, bindings);

  const rows = resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTables() {
  const tableNames = await listAllTableNames();
  const tablesToDelete = _.without(tableNames,
    'knex_migrations',
    'knex_migrations_lock'
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
