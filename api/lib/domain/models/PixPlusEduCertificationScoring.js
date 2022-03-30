const PartnerCertificationScoring = require('./PartnerCertificationScoring');

class PixPlusEduCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      certificationCourseId,
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
