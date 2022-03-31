const PartnerCertificationScoring = require('./PartnerCertificationScoring');

class PixPlusEduCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      partnerKey: null,
      temporaryPartnerKey: certifiableBadgeKey,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
  }

  isAcquired() {
    return this.hasAcquiredPixCertification && this.reproducibilityRate.isEqualOrAbove(70);
  }
}

module.exports = PixPlusEduCertificationScoring;
