const CertificationOfficer = require('../../../../lib/domain/models/CertificationOfficer');

module.exports = function buildCertificationOfficer({ id = 123, firstName = 'Dean', lastName = 'Winchester' } = {}) {
  return new CertificationOfficer({
    id,
    firstName,
    lastName,
  });
};
