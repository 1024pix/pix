class CertificationEligibility {
  constructor({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
    pixPlusEduInitieCertificationEligible,
    pixPlusEduConfirmeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
  }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.cleaCertificationEligible = cleaCertificationEligible;
    this.pixPlusDroitMaitreCertificationEligible = pixPlusDroitMaitreCertificationEligible;
    this.pixPlusDroitExpertCertificationEligible = pixPlusDroitExpertCertificationEligible;
    this.pixPlusEduInitieCertificationEligible = pixPlusEduInitieCertificationEligible;
    this.pixPlusEduConfirmeCertificationEligible = pixPlusEduConfirmeCertificationEligible;
    this.pixPlusEduAvanceCertificationEligible = pixPlusEduAvanceCertificationEligible;
    this.pixPlusEduExpertCertificationEligible = pixPlusEduExpertCertificationEligible;
  }
}

module.exports = CertificationEligibility;
