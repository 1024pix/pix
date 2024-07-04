import bluebird from 'bluebird';
import dayjs from 'dayjs';

import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../shared/infrastructure/constants.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../shared/domain/constants.js';

/**
 * @typedef {import('./index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import('./index.js').TemporaryCompanionStorageService} TemporaryCompanionStorageService
 */

/**
 * @param {Object} params
 * @param {SessionForSupervisingRepository} params.sessionForSupervisingRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {TemporaryCompanionStorageService} params.temporaryCompanionStorageService
 */
const getSessionForSupervising = async function ({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
  temporaryCompanionStorageService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get({ id: sessionId });
  const activatedCompanionCertificationCandidateIds = await temporaryCompanionStorageService.getBySessionId(sessionId);

  await bluebird.map(
    sessionForSupervising.certificationCandidates,
    _computeComplementaryCertificationEligibility(certificationBadgesService),
    { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
  );

  sessionForSupervising.certificationCandidates.forEach((certificationCandidate) => {
    _setCompanionStatus(certificationCandidate, activatedCompanionCertificationCandidateIds);
    _computeTheoricalEndDateTime(certificationCandidate);
  });

  return sessionForSupervising;
};

export { getSessionForSupervising };

function _setCompanionStatus(certificationCandidate, activatedCompanionCertificationCandidateIds) {
  if (activatedCompanionCertificationCandidateIds.includes(certificationCandidate.id)) {
    certificationCandidate.isCompanionActive = true;
  }
}

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
