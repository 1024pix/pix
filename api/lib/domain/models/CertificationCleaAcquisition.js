const _ = require('lodash');
const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('./CertificationPartnerAcquisition');
const MIN_PERCENTAGE = 75;

const { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

function _isOverPercentage(value = 0, total, percentage = MIN_PERCENTAGE) {
  return value >= (total * percentage / 100);
}

function _hasRequiredPixValue({ totalPixCleaByCompetence, competenceMarks }) {
  const certifiableCompetenceIds = _.map(competenceMarks, 'competenceId');
  const partnerCompetenceIds = _.keys(totalPixCleaByCompetence);
  const consideredCompetenceIds = _.intersection(certifiableCompetenceIds, partnerCompetenceIds);
  return !_.isEmpty(consideredCompetenceIds)
    && _.every(consideredCompetenceIds, (competenceId) => _isOverPercentage(
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

class CertificationCleaAcquisition extends CertificationPartnerAcquisition {

  constructor({
    certificationCourseId,
    hasAcquiredBadgeClea,
    reproducibilityRate,
    competenceMarks,
    totalPixCleaByCompetence
  } = {}) {
    super({
      certificationCourseId,
      partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
    });

    this.hasAcquiredBadge = hasAcquiredBadgeClea;
    this.reproducibilityRate = reproducibilityRate;
    this.competenceMarks = competenceMarks;
    this.totalPixCleaByCompetence = totalPixCleaByCompetence;
  }

  isEligible() {
    return this.hasAcquiredBadge;
  }

  isAcquired() {
    if (_hasNotMinimumReproducibilityRateToBeTrusted(this.reproducibilityRate)) return false;

    if (_hasSufficientReproducibilityRateToBeCertified(this.reproducibilityRate)) return true;

    return _hasRequiredPixValue({
      competenceMarks: this.competenceMarks,
      totalPixCleaByCompetence:this.totalPixCleaByCompetence
    });
  }

  static create({
    certificationCourseId,
    hasAcquiredBadgeClea,
    reproducibilityRate,
    competenceMarks,
    totalPixCleaByCompetence
  }) {
    return new CertificationCleaAcquisition({
      certificationCourseId,
      hasAcquiredBadgeClea,
      reproducibilityRate,
      competenceMarks,
      totalPixCleaByCompetence
    });
  }
}

module.exports = CertificationCleaAcquisition;
