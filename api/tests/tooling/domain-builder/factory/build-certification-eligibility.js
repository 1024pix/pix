const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

module.exports = function buildCertificationEligibility({
  id = 123,
  pixCertificationEligible = false,
  eligibleComplementaryCertifications = [],
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    eligibleComplementaryCertifications,
  });
};
