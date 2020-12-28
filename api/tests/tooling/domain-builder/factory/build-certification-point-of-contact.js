const CertificationPointOfContact = require('../../../../lib/domain/read-models/CertificationPointOfContact');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');

module.exports = function buildCertificationPointOfContact(
  {
    id = 123,
    firstName = 'Chèvre',
    lastName = 'Brebis',
    email = 'chevre.brebis@example.net',
    pixCertifTermsOfServiceAccepted = true,
    certificationCenterId = 456,
    certificationCenterName = 'Centre de la prairie verdoyante',
    certificationCenterType = CertificationCenter.types.PRO,
    certificationCenterExternalId = 'CHEVRE456',
    isRelatedOrganizationManagingStudents = false,
  } = {}) {

  return new CertificationPointOfContact({
    id,
    firstName,
    lastName,
    email,
    pixCertifTermsOfServiceAccepted,
    certificationCenterId,
    certificationCenterName,
    certificationCenterType,
    certificationCenterExternalId,
    isRelatedOrganizationManagingStudents,
  });
};
