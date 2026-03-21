import lodash from 'lodash';

const { get, update } = lodash;
import { tokenService } from '../domain/services/token-service.js';
import { executionContextManager, getContext, getInContext, setInContext } from './execution-context-manager.js';

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

export function incrementInContext(path, increment = 1) {
  const store = executionContextManager.getStore();
  if (!store) return;
  update(store, path, (v) => (v ?? 0) + increment);
}

export const monitoringTools = {
  getContext,
  getInContext,
  incrementInContext,
  setInContext,
};

export { getContext, getInContext, setInContext };
