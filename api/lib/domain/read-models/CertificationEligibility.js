const { keys } = require('../models/Badge');
const cleaBadgeKey = keys.PIX_EMPLOI_CLEA;
const pixPlusDroitMaitreBadgeKey = keys.PIX_DROIT_MAITRE_CERTIF;
const pixPlusDroitExpertBadgeKey = keys.PIX_DROIT_EXPERT_CERTIF;

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

CertificationEligibility.cleaBadgeKey = cleaBadgeKey;
CertificationEligibility.pixPlusDroitMaitreBadgeKey = pixPlusDroitMaitreBadgeKey;
CertificationEligibility.pixPlusDroitExpertBadgeKey = pixPlusDroitExpertBadgeKey;
module.exports = CertificationEligibility;
