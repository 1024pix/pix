const CertificationPointOfContact = require('../../../../lib/domain/read-models/CertificationPointOfContact');
const buildAllowedCertificationCenterAccess = require('./build-allowed-certification-center-access');

module.exports = function buildCertificationPointOfContact({
  id = 123,
  firstName = 'Chèvre',
  lastName = 'Brebis',
  email = 'chevre.brebis@example.net',
  pixCertifTermsOfServiceAccepted = true,
  allowedCertificationCenterAccesses = [buildAllowedCertificationCenterAccess()],
} = {}) {
  return new CertificationPointOfContact({
    id,
    firstName,
    lastName,
    email,
    pixCertifTermsOfServiceAccepted,
    allowedCertificationCenterAccesses,
  });
};
