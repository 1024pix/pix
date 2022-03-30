const PartnerCertificationScoring = require('./PartnerCertificationScoring');

class PixPlusDroitCertificationScoring extends PartnerCertificationScoring {
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
      partnerKey: certifiableBadgeKey,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
  }

  isAcquired() {
    return this.hasAcquiredPixCertification && this.reproducibilityRate.isEqualOrAbove(75);
  }
}

module.exports = PixPlusDroitCertificationScoring;
