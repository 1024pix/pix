import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../shared/domain/constants.js';

/**
 * @typedef {import('./index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 */

/**
 * @param {Object} params
 * @param {SessionForSupervisingRepository} params.sessionForSupervisingRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 */
const getSessionForSupervising = async function ({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get({ id: sessionId });

  await PromiseUtils.map(
    sessionForSupervising.certificationCandidates,
    _computeDoubleCertificationEligibility(certificationBadgesService),
    { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
  );

  sessionForSupervising.certificationCandidates.forEach((certificationCandidate) => {
    _computeDuration(certificationCandidate);
  });

  return sessionForSupervising;
};

export { getSessionForSupervising };

/**
 * @param {CertificationBadgesService} certificationBadgesService
 */
function _computeDoubleCertificationEligibility(certificationBadgesService) {
  return async (candidate) => {
    if (candidate.enrolledDoubleCertification?.key) {
      candidate.stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: candidate.userId,
      });
    }
  };
}

function _computeDuration(candidate) {
  if (candidate.enrolledComplementaryCertification) {
    candidate.duration = candidate.enrolledComplementaryCertification.duration;
  } else {
    candidate.duration = DEFAULT_SESSION_DURATION_MINUTES;
  }
}
