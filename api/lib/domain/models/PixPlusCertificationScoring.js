const ComplementaryCertificationCourseResult = require('./ComplementaryCertificationCourseResult');
const PartnerCertificationScoring = require('./PartnerCertificationScoring');

class PixPlusCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeKey,
    reproducibilityRate,
    hasAcquiredPixCertification,
    minimumReproducibilityRate,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      partnerKey: complementaryCertificationBadgeKey,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });

    this.reproducibilityRate = reproducibilityRate;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
    this.minimumReproducibilityRate = minimumReproducibilityRate;
  }

  isAcquired() {
    return this.hasAcquiredPixCertification && this.reproducibilityRate.isEqualOrAbove(this.minimumReproducibilityRate);
  }
}

module.exports = PixPlusCertificationScoring;
