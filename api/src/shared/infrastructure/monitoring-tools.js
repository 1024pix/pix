import lodash from 'lodash';

import { config } from '../config.js';

const { get, update } = lodash;
import { asyncLocalStorage, getContext, getInContext, setInContext } from './async-local-storage.js';
import * as requestResponseUtils from './utils/request-response-utils.js';

function getRequestId() {
  if (!config.hapi.enableRequestMonitoring) {
    return null;
  }

  const context = getContext();

  return get(context, 'request.headers.x-request-id', null);
}

function getCorrelationContext() {
  if (!config.hapi.enableRequestMonitoring) {
    return {};
  }
  const context = asyncLocalStorage.getStore();
  const request = get(context, 'request', null);

  if (!request) return {};

  return {
    user_id: extractUserIdFromRequest(request),
    request_id: get(request, 'headers.x-request-id', '-'),
  };
}

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');
  if (!userId && get(request, 'headers.authorization')) userId = requestResponseUtils.extractUserIdFromRequest(request);
  return userId || '-';
}

function incrementInContext(path, increment = 1) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + increment);
}

const monitoringTools = {
  extractUserIdFromRequest,
  getContext,
  getInContext,
  incrementInContext,
  setInContext,
};

export {
  asyncLocalStorage,
  extractUserIdFromRequest,
  getContext,
  getCorrelationContext,
  getInContext,
  getRequestId,
  incrementInContext,
  monitoringTools,
  setInContext,
};
