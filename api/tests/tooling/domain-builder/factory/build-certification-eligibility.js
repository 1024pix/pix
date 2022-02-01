const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

module.exports = function buildCertificationEligibility({
  id = 123,
  pixCertificationEligible = true,
  cleaCertificationEligible = false,
  pixPlusDroitMaitreCertificationEligible = false,
  pixPlusDroitExpertCertificationEligible = true,
  pixPlusEduInitieCertificationEligible = false,
  pixPlusEduConfirmeCertificationEligible = false,
  pixPlusEduAvanceCertificationEligible = false,
  pixPlusEduExpertCertificationEligible = false,
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
    pixPlusEduInitieCertificationEligible,
    pixPlusEduConfirmeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
  });
};
