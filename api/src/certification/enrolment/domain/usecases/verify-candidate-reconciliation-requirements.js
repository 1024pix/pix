/**
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

import { UserNotAuthorizedToCertifyError } from '../../../../shared/domain/errors.js';
import * as injectedPlacementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js';
import * as injectedCertificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {number} params.sessionId
 * @param {PlacementProfileService} params.placementProfileService
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 *
 * @returns {Promise<void>} if candidate is deemed eligible
 * @throws {UserNotAuthorizedToCertifyError} candidate is not certifiable for CORE
 */
export async function verifyCandidateReconciliationRequirements({
  candidate,
  sessionId,
  placementProfileService = injectedPlacementProfileService,
  certificationCenterRepository = injectedCertificationCenterRepository,
} = {}) {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  if (candidate.hasComplementarySubscription()) {
    const complementarySubscription = candidate.getComplementarySubscription();
    const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

    if (!certificationCenter.isHabilitated(complementarySubscription.complementaryCertificationKey)) {
      throw new CenterHabilitationError();
    }
  }
}
