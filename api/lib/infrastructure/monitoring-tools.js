import async_hooks from 'node:async_hooks';

import Request from '@hapi/hapi/lib/request.js';
import lodash from 'lodash';

import {
  getCorrelationContext,
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
} from '../../src/shared/infrastructure/utils/logger.js';
import * as requestResponseUtils from '../../src/shared/infrastructure/utils/request-response-utils.js';
import { config } from '../config.js';

const { get, set, update } = lodash;

const { AsyncLocalStorage } = async_hooks;

const asyncLocalStorage = new AsyncLocalStorage();

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
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
  pushInContext,
  setInContext,
  asyncLocalStorage,
};

export {
  asyncLocalStorage,
  extractUserIdFromRequest,
  getContext,
  getCorrelationContext,
  getInContext,
  incrementInContext,
  installHapiHook,
  logErrorWithCorrelationIds,
  logInfoWithCorrelationIds,
  monitoringTools,
  pushInContext,
  setInContext,
};
