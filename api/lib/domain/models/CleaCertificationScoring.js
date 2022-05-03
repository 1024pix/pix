const PartnerCertificationScoring = require('./PartnerCertificationScoring');
const { NotEligibleCandidateError } = require('../errors');
const Joi = require('joi');
const { validateEntity } = require('../validators/entity-validator');

class CleaCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    isBadgeAcquisitionStillValid = true,
    cleaBadgeKey,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
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
    this.minimumEarnedPix = minimumEarnedPix;
    this.minimumReproducibilityRate = minimumReproducibilityRate;

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
    return this._isAboveMinimumReproducibilityRate() && this._isAboveMinimumScore();
  }

  _isAboveMinimumScore() {
    return this.pixScore >= this.minimumEarnedPix;
  }

  _isAboveMinimumReproducibilityRate() {
    return this.reproducibilityRate >= this.minimumReproducibilityRate;
  }
}

module.exports = CleaCertificationScoring;
