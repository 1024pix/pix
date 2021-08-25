const { get } = require('lodash');
const logger = require('../infrastructure/logger');
const { logging } = require('../config');

const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

function logKnexQueriesWithCorrelationId(data, msg) {
  if (logging.enableLogKnexQueriesWithCorrelationId) {
    const request = asyncLocalStorage.getStore();
    const knexQueryId = data.__knexQueryUid;
    logger.info({
      request_id: `${get(request, 'info.id', '-')}`,
      knex_query_id: knexQueryId,
      knex_query_position: get(request, ['knexQueryPosition', knexQueryId ], '-'),
      knex_query_sql: data.sql,
      knex_query_params: [(data.bindings) ? data.bindings.join(',') : ''],
      duration: get(data, 'duration', '-'),
      http: {
        method: get(request, 'method', '-'),
        url_detail: {
          path: get(request, 'path', '-'),
        },
      },
    }, msg);
  }
}

function logErrorWithCorrelationId(error) {
  const request = asyncLocalStorage.getStore();
  logger.error({
    request_id: `${get(request, 'info.id', '-')}`,
    http: {
      method: get(request, 'method', '-'),
      url_detail: {
        path: get(request, 'path', '-'),
      },
    },
  }, error);
}

function addPositionToQuerieAndIncrementQueriesCounter(knexQueryId) {
  const request = asyncLocalStorage.getStore();
  if (request) {
    request.knexQueryPosition = request.knexQueryPosition || [];
    request.queriesCounter = request.queriesCounter || 0;
    request.queriesCounter++;
    request.knexQueryPosition[knexQueryId] = request.queriesCounter;
  }
}

module.exports = {
  asyncLocalStorage,
  addPositionToQuerieAndIncrementQueriesCounter,
  logKnexQueriesWithCorrelationId,
  logErrorWithCorrelationId,
};
