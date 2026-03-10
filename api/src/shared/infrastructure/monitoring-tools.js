import lodash from 'lodash';

const { get, update } = lodash;
import { tokenService } from '../domain/services/token-service.js';
import { asyncLocalStorage, getContext, getInContext, setInContext } from './async-local-storage.js';

export function getRequestId() {
  const context = getContext();

  return get(context, 'request.headers.x-request-id', null);
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
