import { randomUUID } from 'node:crypto';

import lodash from 'lodash';

import { config } from '../config.js';

const { get, update } = lodash;
import { tokenService } from '../domain/services/token-service.js';
import { asyncLocalStorage, getContext, getInContext, setInContext } from './async-local-storage.js';

export function getRequestId() {
  if (!config.hapi.enableRequestMonitoring) {
    return null;
  }

  const context = getContext();

  return get(context, 'request.headers.x-request-id', null);
}

export function getCorrelationContext() {
  if (!config.hapi.enableRequestMonitoring) {
    return {};
  }
  const context = asyncLocalStorage.getStore();
  const request = get(context, 'request', null);

  if (!request) return {};

  return {
    user_id: extractUserIdFromRequest(request),
    request_id: get(request, 'headers.x-request-id', `default_${randomUUID()}`),
  };
}

export function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');

  if (!userId && get(request, 'headers.authorization')) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    userId = tokenService.extractUserId(token);
  }

  return userId || '-';
}

export function incrementInContext(path, increment = 1) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + increment);
}

export const monitoringTools = {
  extractUserIdFromRequest,
  getContext,
  getInContext,
  incrementInContext,
  setInContext,
};

export { asyncLocalStorage, getContext, getInContext, setInContext };
