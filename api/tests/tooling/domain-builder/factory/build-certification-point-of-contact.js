import CertificationPointOfContact from '../../../../lib/domain/read-models/CertificationPointOfContact';
import buildAllowedCertificationCenterAccess from './build-allowed-certification-center-access';

export default function buildCertificationPointOfContact({
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
}
