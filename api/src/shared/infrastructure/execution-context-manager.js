import Request from '@hapi/hapi/lib/request.js';
import lodash from 'lodash';
const { get, set } = lodash;
import { AsyncLocalStorage } from 'node:async_hooks';

export const executionContextManager = new AsyncLocalStorage();

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
