class CertificationEligibility {
  constructor({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
    pixPlusEduAutonomeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
    pixPlusEduFormateurCertificationEligible,
  }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.cleaCertificationEligible = cleaCertificationEligible;
    this.pixPlusDroitMaitreCertificationEligible = pixPlusDroitMaitreCertificationEligible;
    this.pixPlusDroitExpertCertificationEligible = pixPlusDroitExpertCertificationEligible;
    this.pixPlusEduAutonomeCertificationEligible = pixPlusEduAutonomeCertificationEligible;
    this.pixPlusEduAvanceCertificationEligible = pixPlusEduAvanceCertificationEligible;
    this.pixPlusEduExpertCertificationEligible = pixPlusEduExpertCertificationEligible;
    this.pixPlusEduFormateurCertificationEligible = pixPlusEduFormateurCertificationEligible;
  }
}

module.exports = CertificationEligibility;
