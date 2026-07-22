import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/constants.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

/**
 * @typedef {import('./index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 */

/**
 * @param {object} params
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

  return sessionForSupervising;
};

export { getSessionForSupervising };

/**
 * @param {CertificationBadgesService} certificationBadgesService
 */
function _computeDoubleCertificationEligibility(certificationBadgesService) {
  return async (candidate) => {
    if (candidate.subscription === Frameworks.CLEA) {
      candidate.stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: candidate.userId,
      });
    }
  };
}
