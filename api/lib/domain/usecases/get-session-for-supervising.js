const moment = require('moment');
const { constants } = require('../constants');

module.exports = async function getSessionForSupervising({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get(sessionId);

  await Promise.all(
    sessionForSupervising.certificationCandidates
      .filter((candidate) => candidate.enrolledComplementaryCertification)
      .map(_computeComplementaryCertificationEligibility(certificationBadgesService))
  );

  sessionForSupervising.certificationCandidates.forEach(_computeTheoricalEndDateTime);

  return sessionForSupervising;
};

function _computeComplementaryCertificationEligibility(certificationBadgesService) {
  return async (candidate) => {
    candidate.stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId: candidate.userId,
    });
  };
}

function _computeTheoricalEndDateTime(candidate) {
  const startDateTime = moment(candidate.startDateTime || null);
  if (!startDateTime.isValid()) {
    return;
  }

  startDateTime.add(constants.PIX_CERTIF.DEFAULT_SESSION_DURATION_MINUTES, 'minutes');

  if (candidate.isStillEligibleToComplementaryCertification()) {
    const extraMinutes = candidate.enrolledComplementaryCertificationSessionExtraTime ?? 0;
    startDateTime.add(extraMinutes, 'minutes');
  }

  candidate.theoricalEndDateTime = startDateTime.toDate();
}
