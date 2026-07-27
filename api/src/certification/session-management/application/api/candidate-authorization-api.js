import * as candidateAuthorizationInfoRepository from '../../infrastructure/repositories/candidate-authorization-info-repository.js';

/**
 * @typedef {Object} DTOCandidateAuthorization
 * @property {number} id
 * @property {string} accessCode
 * @property {boolean} isSessionAccessible
 * @property {number} userId
 * @property {boolean} authorizedToStart
 * @property {number} certificationId
 * @property {Date} reconciledAt
 * @property {string} subscription
 * @property {boolean} hasExceededCertificationDuration
 * @property {boolean} isCenterHabilitatedForCandidateSubscription
 * @property {object} centerHabilitations
 */

/**
 * @function
 * @name findByUserIdAndSessionId
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @returns {Promise<DTOCandidateAuthorization|null>}
 */
export async function findByUserIdAndSessionId({
  userId,
  sessionId,
  dependencies = { candidateAuthorizationInfoRepository },
}) {
  const candidateAuthorizationInfo = await dependencies.candidateAuthorizationInfoRepository.findByUserIdAndSessionId({
    userId,
    sessionId,
  });
  if (!candidateAuthorizationInfo) {
    return null;
  }

  return {
    id: candidateAuthorizationInfo.id,
    accessCode: candidateAuthorizationInfo.sessionAccessCode,
    isSessionAccessible: candidateAuthorizationInfo.isSessionAccessible,
    userId: candidateAuthorizationInfo.reconciledUserId,
    reconciledAt: candidateAuthorizationInfo.reconciledAt,
    subscription: candidateAuthorizationInfo.subscription,
    authorizedToStart: candidateAuthorizationInfo.authorizedToStart,
    certificationId: candidateAuthorizationInfo.certificationId,
    hasExceededCertificationDuration: candidateAuthorizationInfo.hasExceededCertificationDuration,
    isCenterHabilitatedForCandidateSubscription: candidateAuthorizationInfo.isCenterHabilitatedForCandidateSubscription,
  };
}
