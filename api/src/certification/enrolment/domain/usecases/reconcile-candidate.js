/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('../models/SessionEnrolment.js').SessionEnrolment} SessionEnrolment
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {SessionEnrolment} params.session
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 * @param {PlacementProfileService} params.placementProfileService
 *
 * @returns {Promise<Candidate>}
 */
export async function reconcileCandidate({ userId, candidate, candidateRepository, placementProfileService }) {
  candidate.reconcile(userId);

  if (candidate.hasCoreSubscription()) {
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: candidate.userId,
      limitDate: candidate.reconciledAt,
    });

    if (!placementProfile.isCertifiable()) {
      throw new UserNotAuthorizedToCertifyError();
    }
  }

  await _saveReconcilement({ candidate, candidateRepository });
  return candidate;
}

const _saveReconcilement = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.userId
   * @param {Candidate} params.candidate
   * @param {CandidateRepository} params.candidateRepository
   */
  async ({ candidate, candidateRepository }) => {
    return candidateRepository.update(candidate);
  },
);
