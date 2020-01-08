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
    'knex_migrations_lock',
    'pix_roles'
  );

  const query = _dbSpecificQueries[_clientName].truncateTableQuery;

  for (const tableName of tablesToDelete) {
    await knex.raw(query, [tableName]);
  }
}

async function listTablesByDependencyOrderDesc() {
  // See this link : https://stackoverflow.com/questions/51279588/sort-tables-in-order-of-dependency-postgres
  const resultSet = await knex.raw('with recursive fk_tree as ( ' +
    'select t.oid as reloid, ' +
    't.relname as table_name, ' +
    's.nspname as schema_name, ' +
    'null::text as referenced_table_name, ' +
    'null::text as referenced_schema_name, ' +
    '1 as level ' +
    'from pg_class t ' +
    'join pg_namespace s on s.oid = t.relnamespace ' +
    'where relkind = \'r\' ' +
    'and not exists (select * ' +
    'from pg_constraint ' +
    'where contype = \'f\' ' +
    'and conrelid = t.oid) ' +
    'and s.nspname = \'public\' ' +
    'union all ' +
    'select ref.oid, ' +
    'ref.relname, ' +
    'rs.nspname, ' +
    'p.table_name, ' +
    'p.schema_name, ' +
    'p.level + 1 ' +
    'from pg_class ref ' +
    'join pg_namespace rs on rs.oid = ref.relnamespace ' +
    'join pg_constraint c on c.contype = \'f\' and c.conrelid = ref.oid ' +
    'join fk_tree p on p.reloid = c.confrelid ), all_tables as ( ' +
    'select schema_name, table_name, level, row_number() over (partition by schema_name, table_name order by level desc) as ' +
    'last_table_row from fk_tree ) ' +
    'select table_name ' +
    'from all_tables at where last_table_row = 1 order by level DESC;');

  return _.map(resultSet.rows, 'table_name');
}

async function disconnect() {
  return knex.destroy();
}

module.exports = {
  knex,
  disconnect,
  listAllTableNames,
  emptyAllTables,
  listTablesByDependencyOrderDesc,
};
