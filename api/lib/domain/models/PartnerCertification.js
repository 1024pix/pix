class PartnerCertification {
  constructor(
    {
      certificationCourseId,
      partnerKey,
    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
  }

  isEligible() {}

  isAcquired() {}
}

module.exports = PartnerCertification;
