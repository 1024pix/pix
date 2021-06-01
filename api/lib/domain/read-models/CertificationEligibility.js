const { keys } = require('../models/Badge');
const cleaBadgeKey = keys.PIX_EMPLOI_CLEA;

class CertificationEligibility {
  constructor({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
  }) {
    this.id = id;
    this.pixCertificationEligible = pixCertificationEligible;
    this.cleaCertificationEligible = cleaCertificationEligible;
  }
}

CertificationEligibility.cleaBadgeKey = cleaBadgeKey;
module.exports = CertificationEligibility;
