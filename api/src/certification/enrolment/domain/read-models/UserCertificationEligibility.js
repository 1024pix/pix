class UserCertificationEligibility {
  constructor({ id, isCertifiable, certificationEligibilities = [] }) {
    this.id = id;
    this.isCertifiable = isCertifiable;
    this.certificationEligibilities = certificationEligibilities;
  }
}

class CertificationEligibility {
  constructor({ label, imageUrl, isOutdated, isAcquiredExpectedLevel }) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.isOutdated = isOutdated;
    this.isAcquiredExpectedLevel = isAcquiredExpectedLevel;
  }
}

export { CertificationEligibility, UserCertificationEligibility };
