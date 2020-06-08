const statuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_PASSED: 'not_passed',
};

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

  isEligible() {}

  isAcquired() {}

  static certificationStatus(partnerCertification) {
    if (partnerCertification) {
      return partnerCertification.acquired ? statuses.ACQUIRED : statuses.REJECTED;
    }
    return statuses.NOT_PASSED;
  }
}

PartnerCertification.statuses = statuses;
module.exports = PartnerCertification;
