const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

module.exports = function buildCertificationEligibility({
  id = 123,
  pixCertificationEligible = true,
  cleaCertificationEligible = false,
  pixPlusDroitMaitreCertificationEligible = false,
  pixPlusDroitExpertCertificationEligible = true,
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  });
};
