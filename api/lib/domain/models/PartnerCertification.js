class PartnerCertification {
  constructor(
    {
      certificationCourseId,
      partnerKey,
      acquired,
    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
  }

  isEligible() {
  }

  isAcquired() {}
}

module.exports = PartnerCertification;
