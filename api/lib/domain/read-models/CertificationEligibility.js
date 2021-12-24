class CertificationEligibility {
  constructor({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.cleaCertificationEligible = cleaCertificationEligible;
    this.pixPlusDroitMaitreCertificationEligible = pixPlusDroitMaitreCertificationEligible;
    this.pixPlusDroitExpertCertificationEligible = pixPlusDroitExpertCertificationEligible;
  }
}

module.exports = CertificationEligibility;
