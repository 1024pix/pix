const CertificationEligibility = require('../../../../lib/domain/read-models/CertificationEligibility');

module.exports = function buildCertificationEligibility({
  id = 123,
  pixCertificationEligible = true,
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
  });
};
