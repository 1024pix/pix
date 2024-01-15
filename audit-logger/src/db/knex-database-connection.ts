import knex from 'knex';
import pg from 'pg';
import _ from 'lodash';

import { config } from '../lib/config.js';
import knexConfigs from './knexfile.js';

const types = pg.types;

/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
types.setTypeParser(types.builtins.DATE, (value) => value);

const { environment } = config;
const knexConfig = knexConfigs[environment];
const configuredKnex = knex(knexConfig);
const databaseName = configuredKnex.client.database();
const dbSpecificQueries = {
  listTablesQuery:
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
  emptyTableQuery: 'TRUNCATE ',
};

async function disconnect(): Promise<void> {
  await configuredKnex.destroy();
}

async function emptyAllTables(): Promise<void> {
  const tableNames = await _listAllTableNames();

  if (tableNames.length === 0) return;

  const tablesToDelete = _.without(
    tableNames,
    'knex_migrations',
    'knex_migrations_lock',
  );
  const tables = _.map(tablesToDelete, (tableToDelete) => `"${tableToDelete}"`).join();
  const query = dbSpecificQueries.emptyTableQuery;

  await configuredKnex.raw(`${query}${tables}`);
}

export { configuredKnex as knex, disconnect, emptyAllTables };

async function _listAllTableNames(): Promise<string[]> {
  const bindings = [databaseName];
  const resultSet = await configuredKnex.raw(dbSpecificQueries.listTablesQuery, bindings);
  const rows: any[] = resultSet.rows;

  return _.map(rows, 'table_name');
}
