const types = require('pg').types;
const { get } = require('lodash');
const logger = require('../lib/infrastructure/logger');
const monitoringTools = require('../lib/infrastructure/monitoring-tools');
const { logging } = require('../lib/config');
const { performance } = require('perf_hooks');
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

/* QueryBuilder Extension */
const Knex = require('knex');
const QueryBuilder = require('knex/lib/query/querybuilder');

try {
  Knex.QueryBuilder.extend('whereInArray', function (column, values) {
    return this.where(column, knex.raw('any(?)', [values]));
  });
} catch (e) {
  if (e.message !== "Can't extend QueryBuilder with existing method ('whereInArray').") {
    logger.error(e);
  }
}
/* -------------------- */

const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

const originalToSQL = QueryBuilder.prototype.toSQL;
QueryBuilder.prototype.toSQL = function () {
  const ret = originalToSQL.apply(this);
  const request = monitoringTools.getInContext('request');
  const comments = [['path', get(request, 'route.path')]].map((comment) => comment.join(': ')).join(' ');
  ret.sql = `/* ${comments} */ `.concat(ret.sql);
  return ret;
};

knex.on('query', function (data) {
  if (logging.enableKnexPerformanceMonitoring) {
    const queryId = data.__knexQueryUid;
    monitoringTools.setInContext(`knexQueryStartTimes.${queryId}`, performance.now());
  }
});

knex.on('query-response', function (response, data) {
  monitoringTools.incrementInContext('metrics.knexQueryCount');
  if (logging.enableKnexPerformanceMonitoring) {
    const queryStartedTime = monitoringTools.getInContext(`knexQueryStartTimes.${data.__knexQueryUid}`);
    if (queryStartedTime) {
      const duration = performance.now() - queryStartedTime;
      monitoringTools.incrementInContext('metrics.knexTotalTimeSpent', duration);
    }
  }
});

async function disconnect() {
  return knex.destroy();
}

const _databaseName = knex.client.database();

const _dbSpecificQueries = {
  listTablesQuery:
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
  emptyTableQuery: 'TRUNCATE ',
};

async function listAllTableNames() {
  const bindings = [_databaseName];

  const resultSet = await knex.raw(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    bindings
  );

  const rows = resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTables() {
  const tableNames = await listAllTableNames();
  const tablesToDelete = _.without(tableNames, 'knex_migrations', 'knex_migrations_lock', 'features');

  const tables = _.map(tablesToDelete, (tableToDelete) => `"${tableToDelete}"`).join();

  const query = _dbSpecificQueries.emptyTableQuery;
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`${query}${tables}`);
}

module.exports = {
  knex,
  disconnect,
  emptyAllTables,
};
