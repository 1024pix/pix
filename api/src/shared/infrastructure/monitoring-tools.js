import Request from '@hapi/hapi/lib/request.js';
import lodash from 'lodash';

import { config } from '../config.js';

const { get, set, update } = lodash;
import async_hooks from 'node:async_hooks';

import * as requestResponseUtils from './utils/request-response-utils.js';

const { AsyncLocalStorage } = async_hooks;

const asyncLocalStorage = new AsyncLocalStorage();

function getCorrelationContext() {
  if (!config.hapi.enableRequestMonitoring) {
    return {};
  }
  const context = asyncLocalStorage.getStore();
  const request = get(context, 'request');
  return {
    user_id: extractUserIdFromRequest(request),
    request_id: get(request, 'headers.x-request-id', '-'),
    id: get(request, 'info.id', '-'),
  };
}

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');
  if (!userId && get(request, 'headers.authorization')) userId = requestResponseUtils.extractUserIdFromRequest(request);
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

function incrementInContext(path, increment = 1) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + increment);
}

function getContext() {
  return asyncLocalStorage.getStore();
}

function installHapiHook() {
  if (!config.hapi.enableRequestMonitoring) return;

  const originalMethod = Request.prototype._execute;

  if (!originalMethod) {
    throw new Error('Hapi method Request.prototype._execute not found while patch');
  }

  Request.prototype._execute = function (...args) {
    const request = this;
    const context = { request };
    return asyncLocalStorage.run(context, () => originalMethod.call(request, args));
  };
}

const monitoringTools = {
  extractUserIdFromRequest,
  getContext,
  getInContext,
  incrementInContext,
  installHapiHook,
  setInContext,
  asyncLocalStorage,
  getCorrelationContext,
};

export {
  asyncLocalStorage,
  extractUserIdFromRequest,
  getContext,
  getCorrelationContext,
  getInContext,
  incrementInContext,
  installHapiHook,
  monitoringTools,
  setInContext,
};
