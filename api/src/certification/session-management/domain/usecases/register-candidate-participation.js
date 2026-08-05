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
  console.log("0")
  console.log({userId})
  console.verifyCandidateIdentityService

  try{
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
  }catch(e){
    console.log(e)
  }
  console.log("1")
  if (!candidate.hasCoreScopeSubscription() && !isFrenchDomainExtension) {
    throw new WrongDomainExtensionForPixPlusError();
  }

  console.log("2")
  if (candidate.isReconciled()) {
    return candidate;
  }

  console.log("3")
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
