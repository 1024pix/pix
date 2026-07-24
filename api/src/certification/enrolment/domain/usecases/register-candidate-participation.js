/**
 * @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
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
export const registerCandidateParticipation = withTransaction(
  async ({
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
    verifyCandidateReconciliationRequirementsService,
    eventAdapter,
    placementProfileService,
  }) => {
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

    const reconciliedCandidate = await reconcileCandidateService.reconcileCandidate({
      userId,
      candidate,
      candidateRepository,
      eventAdapter,
    });

    await verifyCandidateReconciliationRequirementsService.verifyCandidateReconciliationRequirements({
      candidate: reconciliedCandidate,
      placementProfileService,
    });

    return reconciliedCandidate;
  },
);
