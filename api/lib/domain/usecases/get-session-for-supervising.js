import bluebird from 'bluebird';
import dayjs from 'dayjs';
import { constants as domainConstants } from '../constants.js';
import { constants as infraConstants } from '../../infrastructure/constants.js';

const getSessionForSupervising = async function ({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get(sessionId);

  await bluebird.map(
    sessionForSupervising.certificationCandidates,
    _computeComplementaryCertificationEligibility(certificationBadgesService),
    { concurrency: infraConstants.CONCURRENCY_HEAVY_OPERATIONS },
  );

  sessionForSupervising.certificationCandidates.forEach(_computeTheoricalEndDateTime);

  return sessionForSupervising;
};

export { getSessionForSupervising };

function _computeComplementaryCertificationEligibility(certificationBadgesService) {
  return async (candidate) => {
    if (candidate.enrolledComplementaryCertification?.key) {
      candidate.stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: candidate.userId,
      });
    }
  };
}

function _computeTheoricalEndDateTime(candidate) {
  const startDateTime = dayjs(candidate.startDateTime || null);
  if (!startDateTime.isValid()) {
    return;
  }

  let theoricalEndDateTime = startDateTime.add(domainConstants.PIX_CERTIF.DEFAULT_SESSION_DURATION_MINUTES, 'minute');

  if (candidate.isStillEligibleToComplementaryCertification) {
    const extraMinutes = candidate.enrolledComplementaryCertification.certificationExtraTime ?? 0;
    theoricalEndDateTime = theoricalEndDateTime.add(extraMinutes, 'minute');
  }

  candidate.theoricalEndDateTime = theoricalEndDateTime.toDate();
}
