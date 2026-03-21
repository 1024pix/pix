import Request from '@hapi/hapi/lib/request.js';
import lodash from 'lodash';
const { get, set, update } = lodash;
import { AsyncLocalStorage } from 'node:async_hooks';

import { tokenService } from '../domain/services/token-service.js';

const executionContextManager = new AsyncLocalStorage();

export function getInContext(path, defaultValue) {
  const store = executionContextManager.getStore();
  if (!store) return;
  return get(store, path, defaultValue);
}

export function setInContext(path, value) {
  const store = executionContextManager.getStore();
  if (!store) return;
  set(store, path, value);
}

export function getContext() {
  return executionContextManager.getStore();
}

export function executeInContext(context, lambda) {
  const currentContext = getContext();
  if (currentContext) {
    Object.assign(currentContext, context);
    return lambda();
  } else {
    return executionContextManager.run(context, lambda);
  }
}

export function getRequestId() {
  const context = getContext();

  return get(context, 'request.headers.x-request-id', null);
}

export function incrementInContext(path, increment = 1) {
  const store = executionContextManager.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + increment);
}

export function getCorrelationContext() {
  const request = getInContext('request', null);
  const scriptName = getInContext('scriptName', null);
  const jobId = getInContext('jobId', null);
  const request_id = get(request, 'headers.x-request-id', getInContext('default_request_id', null));
  const user_id = extractUserIdFromRequest(request);

  return {
    user_id,
    request_id,
    scriptName,
    jobId,
  };
}

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');

  if (!userId && get(request, 'headers.authorization')) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    userId = tokenService.extractUserId(token);
  }

  return userId ?? null;
}

export function installHapiHook() {
  const originalMethod = Request.prototype._execute;

  if (!originalMethod) {
    throw new Error('Hapi method Request.prototype._execute not found while patch');
  }

  Request.prototype._execute = function (...args) {
    const request = this;
    const context = { request, default_request_id: crypto.randomUUID() };
    return executeInContext(context, () => originalMethod.call(request, args));
  };
}
