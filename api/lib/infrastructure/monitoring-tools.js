const { get } = require('lodash');
const logger = require('../infrastructure/logger');
const requestUtils = require('../infrastructure/utils/request-response-utils');

const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

function logInfoWithCorrelationIds(message) {
  const request = asyncLocalStorage.getStore();
  logger.info({
    user_id: extractUserIdFromRequest(request),
    request_id: `${get(request, 'info.id', '-')}`,
  }, message);
}

function logErrorWithCorrelationIds(error) {
  const request = asyncLocalStorage.getStore();
  logger.error({
    user_id: extractUserIdFromRequest(request),
    request_id: `${get(request, 'info.id', '-')}`,
  }, error);
}

function addKnexMetricsToRequestContext(data) {
  const store = asyncLocalStorage.getStore();
  if (store && store.request && store.metrics) {
    store.metrics.queriesCounter++;
    store.metrics.knexQueries.push({
      id: data.__knexQueryUid,
      sql: data.sql,
      params: [(data.bindings) ? data.bindings.join(',') : ''],
      duration: get(data, 'duration', '-'),
    });
  }
}

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');
  if (!userId && get(request, 'headers.authorization')) userId = requestUtils.extractUserIdFromRequest(request);
  return userId || '-';
}

function doesStoreContainsRequest() {
  return (asyncLocalStorage.getStore() !== undefined);
}

module.exports = {
  asyncLocalStorage,
  addKnexMetricsToRequestContext,
  extractUserIdFromRequest,
  doesStoreContainsRequest,
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
};
