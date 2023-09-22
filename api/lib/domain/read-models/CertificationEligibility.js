class CertificationEligibility {
  constructor({ id, pixCertificationEligible, complementaryCertifications = [] }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.complementaryCertifications = complementaryCertifications;
  }

  static notCertifiable({ userId }) {
    return new CertificationEligibility({ id: userId, pixCertificationEligible: false });
  }
}

export { CertificationEligibility };
