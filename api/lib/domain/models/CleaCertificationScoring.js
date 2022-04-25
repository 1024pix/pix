const PartnerCertificationScoring = require('./PartnerCertificationScoring');
const { NotEligibleCandidateError } = require('../errors');
const Joi = require('joi');
const { validateEntity } = require('../validators/entity-validator');

const { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED } = require('../constants');

function _hasNotMinimumReproducibilityRateToBeCertified(reproducibilityRate) {
  return reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
}

class CleaCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    isBadgeAcquisitionStillValid = true,
    cleaBadgeKey,
    pixScore,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      partnerKey: cleaBadgeKey,
    });

    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.hasAcquiredBadge = hasAcquiredBadge;
    this.isBadgeAcquisitionStillValid = isBadgeAcquisitionStillValid;
    this.reproducibilityRate = reproducibilityRate;
    this.pixScore = pixScore;

    const schema = Joi.object({
      hasAcquiredBadge: Joi.boolean().required(),
      reproducibilityRate: Joi.number().required(),
    }).unknown();

    validateEntity(schema, this);
  }

  static buildNotEligible({ complementaryCertificationCourseId }) {
    return new CleaCertificationScoring({
      complementaryCertificationCourseId,
      hasAcquiredBadge: false,
      isBadgeAcquisitionStillValid: false,
      reproducibilityRate: 0,
      cleaBadgeKey: 'no_badge',
    });
  }

  isEligible() {
    return this.hasAcquiredBadge && this.isBadgeAcquisitionStillValid;
  }

  setBadgeAcquisitionStillValid(isValid) {
    this.isBadgeAcquisitionStillValid = isValid;
  }

  isAcquired() {
    if (!this.hasAcquiredBadge) throw new NotEligibleCandidateError();

    if (_hasNotMinimumReproducibilityRateToBeCertified(this.reproducibilityRate)) return false;

    return true;
  }
}

module.exports = CleaCertificationScoring;
