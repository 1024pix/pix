/**
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 */

import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {PlacementProfileService} params.placementProfileService
 *
 * @returns {Promise<void>} if candidate is deemed eligible
 * @throws {UserNotAuthorizedToCertifyError} candidate is not certifiable for CORE
 */
export const verifyCandidateReconciliationRequirements = async ({ candidate, placementProfileService }) => {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }
};
