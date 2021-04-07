const PartnerCertification = require('./PartnerCertification');

class PixPlusCertification extends PartnerCertification {

  constructor({
    certificationCourseId,
    certifiableBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
  } = {}) {
    super({
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

module.exports = PixPlusCertification;
