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

  sessionForSupervising.certificationCandidates.map(_computeTheoricalEndDateTime);

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
  candidate.theoricalEndDateTime = startDateTime
    .add(constants.PIX_CERTIF.DEFAULT_SESSION_DURATION_MINUTES, 'minutes')
    .toDate();
}
