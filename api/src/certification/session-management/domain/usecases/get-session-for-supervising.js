import dayjs from 'dayjs';

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
const getSessionForSupervising = async function ({ sessionId, sessionForSupervisingRepository }) {
  const sessionForSupervising = await sessionForSupervisingRepository.get({ id: sessionId });

  sessionForSupervising.certificationCandidates.forEach(_computeTheoricalEndDateTime);

  return sessionForSupervising;
};

export { getSessionForSupervising };

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
