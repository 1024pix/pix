import * as sessionAuthorizationApi from '../../../session-management/application/api/session-authorization-api.js';
import { SessionAuthorization } from '../../domain/models/SessionAuthorization.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<null|SessionAuthorization>}
 */
export async function find({ sessionId, dependencies = { sessionAuthorizationApi } }) {
  const sessionAuthorizationDTO = await dependencies.sessionAuthorizationApi.findBySessionId({
    sessionId,
  });
  if (!sessionAuthorizationDTO) {
    return null;
  }

  return new SessionAuthorization({
    id: sessionAuthorizationDTO.id,
    isFinalized: sessionAuthorizationDTO.isFinalized,
    hasExpired: sessionAuthorizationDTO.hasExpired,
    hasStarted: sessionAuthorizationDTO.hasStarted,
  });
}
