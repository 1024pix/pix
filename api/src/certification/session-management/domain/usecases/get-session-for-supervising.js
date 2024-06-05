import bluebird from 'bluebird';
import dayjs from 'dayjs';

import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
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

  await bluebird.map(
    sessionForSupervising.certificationCandidates,
    _computeComplementaryCertificationEligibility(certificationBadgesService),
    { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
  );

  sessionForSupervising.certificationCandidates.forEach(_computeTheoricalEndDateTime);

  return sessionForSupervising;
};

export { getSessionForSupervising };

/**
 * @param {CertificationBadgesService} certificationBadgesService
 */
function _computeComplementaryCertificationEligibility(certificationBadgesService) {
  return async (candidate) => {
    if (candidate.enrolledComplementaryCertification?.key) {
      candidate.stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: candidate.userId,
      });
    }
  };
}

/**
 * @param {CertificationCandidateForAd} certificationBadgesService
 */
function _computeTheoricalEndDateTime(candidate) {
  const startDateTime = dayjs(candidate.startDateTime || null);
  if (!startDateTime.isValid()) {
    return;
  }

  let theoricalEndDateTime = startDateTime.add(DEFAULT_SESSION_DURATION_MINUTES, 'minute');

  if (candidate.isStillEligibleToComplementaryCertification) {
    const extraMinutes = candidate.enrolledComplementaryCertification.certificationExtraTime ?? 0;
    theoricalEndDateTime = theoricalEndDateTime.add(extraMinutes, 'minute');
  }

  candidate.theoricalEndDateTime = theoricalEndDateTime.toDate();
}
