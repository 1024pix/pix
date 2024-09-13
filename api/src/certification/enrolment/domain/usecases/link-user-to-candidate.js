/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('../models/SessionEnrolment.js').SessionEnrolment} SessionEnrolment
 */

import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {SessionEnrolment} params.session
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 * @param {PlacementProfileService} params.placementProfileService
 *
 * @returns {Promise<void>}
 */
export async function linkUserToCandidate({ userId, candidate, candidateRepository, placementProfileService }) {
  const hasCoreSubscription = candidate.subscriptions.some((subscription) => subscription.isCore());
  if (hasCoreSubscription) {
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId,
      limitDate: new Date(),
    });

    if (!placementProfile.isCertifiable()) {
      throw new UserNotAuthorizedToCertifyError();
    }
  }

  candidate.link(userId);
  await candidateRepository.update(candidate);
}
