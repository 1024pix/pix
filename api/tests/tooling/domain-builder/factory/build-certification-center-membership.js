const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const buildCertificationCenter = require('./build-certification-center');

module.exports = function buildCertificationCenterMembership(
  {
    id = 1,
    certificationCenter = buildCertificationCenter(),
  } = {}) {

  return new CertificationCenterMembership({
    id,
    certificationCenter,
  });
};
