import * as sessionAuthorizationInfoRepository from '../../infrastructure/repositories/session-authorization-info-repository.js';

/**
 * @typedef {Object} DTOSessionAuthorization
 * @property {number} id
 * @property {SessionStatus} sessionStatus
 * @property {number|null} scoIsManagingStudentsOrganizationId
 * @property {number} certificationCenterId
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
    sessionStatus: sessionAuthorizationInfo.sessionStatus,
    scoIsManagingStudentsOrganizationId: sessionAuthorizationInfo.scoIsManagingStudentsOrganizationId,
    certificationCenterId: sessionAuthorizationInfo.certificationCenterId,
  };
}
