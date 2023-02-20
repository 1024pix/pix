class CertificationEligibility {
  constructor({ id, pixCertificationEligible, eligibleComplementaryCertifications = [] }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.eligibleComplementaryCertifications = eligibleComplementaryCertifications;
  }

  static notCertifiable({ userId }) {
    return new CertificationEligibility({ id: userId, pixCertificationEligible: false });
  }
}

export default CertificationEligibility;
