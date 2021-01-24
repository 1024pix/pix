const types = require('pg').types;

/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
types.setTypeParser(types.builtins.DATE, (value) => value);

/*
The method Bookshelf.Model.count(), used with PostgreSQL, can sometimes returns a BIGINT.
This is not the common case (maybe in several years).
Even though, Bookshelf/Knex have decided to return String.
We decided to parse the result of #count() method to force a resulting INTEGER.

Links :
- problem: https://github.com/bookshelf/bookshelf/issues/1275
- solution: https://github.com/brianc/node-pg-types
 */
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value));

const _ = require('lodash');

const knexConfigs = require('./knexfile');
const { environment } = require('../lib/config');

const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

async function disconnect() {
  return knex.destroy();
}
const _databaseName = knex.client.database();

const _dbSpecificQueries = {
  listTablesQuery: 'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
  emptyTableQuery: 'TRUNCATE ',
};

async function listAllTableNames() {
  const bindings = [_databaseName];
  const query = _dbSpecificQueries.listTablesQuery;

  const resultSet = await knex.raw(query, bindings);

  const rows = resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTables() {

  const tableNames = await listAllTableNames();

  if (tableNames.length === 0) {
    throw new Error('Database has no tables to empty');
  }

  const tablesToDelete = _.without(tableNames,
    'knex_migrations',
    'knex_migrations_lock',
    'pix_roles',
  );

  const tables = _.map(tablesToDelete, (tableToDelete) => `"${tableToDelete}"`).join();

  const query = _dbSpecificQueries.emptyTableQuery;
  // eslint-disable-next-line no-restricted-syntax
  return knex.raw(`${query}${tables}`);
}

module.exports = {
  knex,
  disconnect,
  emptyAllTables,
};
