/**
 * @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */
import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import { WrongDomainExtensionForPixPlusError } from '../errors.js';

/**
 * Candidate entry to a certification is a multi step process
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Date} params.birthdate
 * @param {boolean} params.isFrenchDomainExtension
 * @param {Function} params.normalizeStringFnc
 * @returns {Promise<Candidate>}
 */
export async function registerCandidateParticipation({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  isFrenchDomainExtension,
  normalizeStringFnc,
  candidateRepository,
  centerRepository,
  sessionRepository,
  userRepository,
  verifyCandidateIdentityService,
  reconcileCandidateService,
  placementProfileService,
  eventAdapter,
}) {
  const candidate = await verifyCandidateIdentityService.verifyCandidateIdentity({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
    candidateRepository,
    centerRepository,
    sessionRepository,
    userRepository,
  });
  if (!candidate.hasCoreScopeSubscription() && !isFrenchDomainExtension) {
    throw new WrongDomainExtensionForPixPlusError();
  }

  if (candidate.isReconciled()) {
    return candidate;
  }

  const placementProfile = await placementProfileService.getPlacementProfile({
    userId,
    limitDate: new Date(),
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  return reconcileCandidateService.reconcileCandidate({
    userId,
    candidate,
    candidateRepository,
    eventAdapter,
  });
}
