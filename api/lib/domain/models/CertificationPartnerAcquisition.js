const _ = require('lodash');
const MIN_PERCENTAGE = 75;

const { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

function _isOverPercentage(value = 0, total, percentage = MIN_PERCENTAGE) {
  return value >= (total * percentage / 100);
}

function _hasRequiredPixValue({ totalPixCleaByCompetence, competenceMarks }) {
  const competenceIds = _.keys(totalPixCleaByCompetence);
  return !_.isEmpty(competenceIds)
    && _.every(competenceIds, (competenceId) => _isOverPercentage(
      _.find(competenceMarks, { competenceId }).score,
      totalPixCleaByCompetence[competenceId]
    ));
}

function _hasSufficientReproducibilityRateToBeCertified(reproducibilityRate) {
  return reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED;
}

function _hasNotMinimumReproducibilityRateToBeTrusted(reproducibilityRate) {
  return reproducibilityRate <= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
}

class CertificationPartnerAcquisition {
  constructor(
    {
      certificationCourseId,
      partnerKey,

    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
  }

  hasAcquiredCertification({
    hasAcquiredBadge = false,
    reproducibilityRate = 0,
    competenceMarks,
    totalPixCleaByCompetence,
  }) {
    if (!hasAcquiredBadge) return false;
    if (_hasNotMinimumReproducibilityRateToBeTrusted(reproducibilityRate)) return false;

    if (_hasSufficientReproducibilityRateToBeCertified(reproducibilityRate)) return true;

    return _hasRequiredPixValue({ competenceMarks, totalPixCleaByCompetence });
  }

}

module.exports = CertificationPartnerAcquisition;
