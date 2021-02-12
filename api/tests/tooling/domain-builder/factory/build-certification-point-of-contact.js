const CertificationPointOfContact = require('../../../../lib/domain/read-models/CertificationPointOfContact');

module.exports = function buildCertificationPointOfContact({
  id = 123,
  firstName = 'Chèvre',
  lastName = 'Brebis',
  email = 'chevre.brebis@example.net',
  pixCertifTermsOfServiceAccepted = true,
  currentCertificationCenterId = 456,
  certificationCenters,
} = {}) {
  return new CertificationPointOfContact({
    id,
    firstName,
    lastName,
    email,
    pixCertifTermsOfServiceAccepted,
    currentCertificationCenterId,
    certificationCenters,
  });
};
