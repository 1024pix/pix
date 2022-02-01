class PartnerCertification {
  constructor({ certificationCourseId, partnerKey, acquired } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
  }

  static from({ certificationCourseId, partnerKey, acquired }) {
    return new PartnerCertification({ certificationCourseId, partnerKey, acquired });
  }
}

module.exports = PartnerCertification;
