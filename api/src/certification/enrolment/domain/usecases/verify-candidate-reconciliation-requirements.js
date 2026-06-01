/**
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

import { UserNotAuthorizedToCertifyError } from "../../../../shared/domain/errors.js";
import { CenterHabilitationError } from "../../../shared/domain/errors.js";

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {number} params.sessionId
 * @param {PlacementProfileService} params.placementProfileService
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 *
 * @returns {Promise<void>} if candidate is deemed eligible
 * @throws {UserNotAuthorizedToCertifyError} candidate is not certifiable for CORE
 */
export const verifyCandidateReconciliationRequirements = async ({
  candidate,
  sessionId,
  placementProfileService,
  certificationCenterRepository,
}) => {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  if (!candidate.hasCoreFrameworkSubscription()) {
    const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

    if (!certificationCenter.isHabilitated(candidate.subscription)) {
      throw new CenterHabilitationError();
    }
  }
};
