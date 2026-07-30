import * as sessionAuthorizationInfoRepository from '../../infrastructure/repositories/session-authorization-info-repository.js';

/**
 * @typedef {Object} DTOSessionAuthorization
 * @property {number} id
 * @property {boolean} isFinalized
 * @property {boolean} hasExpired
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
  };
}
