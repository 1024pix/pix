import * as candidateAuthorizationApi from '../../../session-management/application/api/candidate-authorization-api.js';
import { CandidateAuthorization } from '../../domain/models/CandidateAuthorization.js';

/**
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @returns {Promise<null|CandidateAuthorization>}
 */
export async function find({ userId, sessionId, dependencies = { candidateAuthorizationApi } }) {
  const candidateAuthorizationDTO = await dependencies.candidateAuthorizationApi.findByUserIdAndSessionId({
    userId,
    sessionId,
  });
  if (!candidateAuthorizationDTO) {
    return null;
  }

  return new CandidateAuthorization({
    id: candidateAuthorizationDTO.id,
    accessCode: candidateAuthorizationDTO.accessCode,
    isSessionJoinable: candidateAuthorizationDTO.isSessionJoinable,
    userId: candidateAuthorizationDTO.userId,
    reconciledAt: candidateAuthorizationDTO.reconciledAt,
    subscription: candidateAuthorizationDTO.subscription,
    authorizedToStart: candidateAuthorizationDTO.authorizedToStart,
    certificationId: candidateAuthorizationDTO.certificationId,
    hasExceededCertificationDuration: candidateAuthorizationDTO.hasExceededCertificationDuration,
    isCenterHabilitatedForCandidateSubscription: candidateAuthorizationDTO.isCenterHabilitatedForCandidateSubscription,
  });
}
