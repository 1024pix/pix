const PartnerCertificationScoring = require('./PartnerCertificationScoring');

class PixPlusEduCertificationScoring extends PartnerCertificationScoring {
  constructor({ certificationCourseId, certifiableBadgeKey, reproducibilityRate, hasAcquiredPixCertification } = {}) {
    super({
      certificationCourseId,
      partnerKey: certifiableBadgeKey,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
  }

  isAcquired() {
    return this.hasAcquiredPixCertification && this.reproducibilityRate.isEqualOrAbove(70);
  }
}

module.exports = PixPlusEduCertificationScoring;
