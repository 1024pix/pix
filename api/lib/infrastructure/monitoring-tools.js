const settings = require('../config');
const { get, set, update } = require('lodash');
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

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');
  if (!userId && get(request, 'headers.authorization')) userId = requestUtils.extractUserIdFromRequest(request);
  return userId || '-';
}

function getInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  return get(store, path, value);
}

function setInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  set(store, path, value);
}

function incrementInContext(path) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + 1);
}

function getContext() {
  return asyncLocalStorage.getStore();
}

function pushInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  let array = get(store, path);
  if (!array) {
    array = [value];
    set(store, path, array);
  } else {
    array.push(value);
  }
}

function installHapiHook() {
  if (!settings.hapi.enableRequestMonitoring) return;

  if (require('@hapi/hapi/package.json').version !== '20.1.3') {
    throw new Error('Hapi version changed, please check if patch still works');
  }

  const Request = require('@hapi/hapi/lib/request');

  const originalMethod = Request.prototype._execute;

  if (!originalMethod) {
    throw new Error('Hapi method Request.prototype._execute not found while patch');
  }

  Request.prototype._execute = function(...args) {
    const request = this;
    const context = { request };
    return asyncLocalStorage.run(context, () => originalMethod.call(request, args));
  };
}

module.exports = {
  extractUserIdFromRequest,
  getContext,
  getInContext,
  incrementInContext,
  installHapiHook,
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
  pushInContext,
  setInContext,
};
