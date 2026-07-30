import * as sessionAuthorizationInfoRepository from '../../infrastructure/repositories/session-authorization-info-repository.js';

/**
 * @typedef {Object} DTOSessionAuthorization
 * @property {number} id
 * @property {boolean} isFinalized
 * @property {boolean} hasExpired
 * @property {boolean} hasStarted
 * @property {number|null} scoIsManagingStudentsOrganizationId
 */

/**
 * @function
 * @name findBySessionId
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<DTOSessionAuthorization|null>}
 */
export async function findBySessionId({ sessionId, dependencies = { sessionAuthorizationInfoRepository } }) {
  const sessionAuthorizationInfo = await dependencies.sessionAuthorizationInfoRepository.findBySessionId({
    sessionId,
  });
  if (!sessionAuthorizationInfo) {
    return null;
  }

  return {
    id: sessionAuthorizationInfo.id,
    isFinalized: sessionAuthorizationInfo.isFinalized,
    hasExpired: sessionAuthorizationInfo.hasExpired,
    hasStarted: sessionAuthorizationInfo.hasStarted,
    scoIsManagingStudentsOrganizationId: sessionAuthorizationInfo.scoIsManagingStudentsOrganizationId,
  };
}
