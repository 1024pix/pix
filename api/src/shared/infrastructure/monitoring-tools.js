import lodash from 'lodash';

const { get } = lodash;
import { tokenService } from '../domain/services/token-service.js';
import { getContext, getInContext, setInContext } from './execution-context-manager.js';

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

export const monitoringTools = {
  getContext,
  getInContext,
};

export { getContext, getInContext, setInContext };
