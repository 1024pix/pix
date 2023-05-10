const bluebird = require('bluebird');
const moment = require('moment');
const { constants: domainConstants } = require('../constants');
const { constants: infraConstants } = require('../../infrastructure/constants.js');

module.exports = async function getSessionForSupervising({
  sessionId,
  sessionForSupervisingRepository,
  certificationBadgesService,
}) {
  const sessionForSupervising = await sessionForSupervisingRepository.get(sessionId);

  await bluebird.map(
    sessionForSupervising.certificationCandidates,
    _computeComplementaryCertificationEligibility(certificationBadgesService),
    { concurrency: infraConstants.CONCURRENCY_HEAVY_OPERATIONS }
  );

  sessionForSupervising.certificationCandidates.forEach(_computeTheoricalEndDateTime);

  return sessionForSupervising;
};

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
  const startDateTime = moment(candidate.startDateTime || null);
  if (!startDateTime.isValid()) {
    return;
  }

  startDateTime.add(domainConstants.PIX_CERTIF.DEFAULT_SESSION_DURATION_MINUTES, 'minutes');

  if (candidate.isStillEligibleToComplementaryCertification) {
    const extraMinutes = candidate.enrolledComplementaryCertification.sessionExtraTime ?? 0;
    startDateTime.add(extraMinutes, 'minutes');
  }

  candidate.theoricalEndDateTime = startDateTime.toDate();
}
