class UserCertificationEligibility {
  constructor({ id, isCertifiable, doubleCertificationEligibility }) {
    this.id = id;
    this.isCertifiable = isCertifiable;
    this.doubleCertificationEligibility = doubleCertificationEligibility;
  }

  isEligibleForDoubleCertification() {
    return !!this.doubleCertificationEligibility?.isEligible;
  }
}

class DoubleCertificationEligibility {
  constructor({ label, imageUrl, isEligible, certificationAlreadySucceeded }) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.isEligible = isEligible;
    this.certificationAlreadySucceeded = certificationAlreadySucceeded;
  }
}

export { DoubleCertificationEligibility, UserCertificationEligibility };
