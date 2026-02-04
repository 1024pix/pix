/**
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js';

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
export const verifyCandidateReconciliationRequirements = withTransaction(
  async ({ candidate, sessionId, placementProfileService, certificationCenterRepository }) => {
    throw new UserNotAuthorizedToCertifyError();
    const placementProfile = await placementProfileService.getPlacementProfile({
      userId: candidate.userId,
      limitDate: candidate.reconciledAt,
    });
    console.log(placementProfile);

    if (!placementProfile.isCertifiable()) {
      console.log('Will throw');
      throw new UserNotAuthorizedToCertifyError();
    }

    if (candidate.hasComplementarySubscription()) {
      const complementarySubscription = candidate.getComplementarySubscription();
      const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

      if (!certificationCenter.isHabilitated(complementarySubscription.complementaryCertificationKey)) {
        throw new CenterHabilitationError();
      }
    }
  },
);
