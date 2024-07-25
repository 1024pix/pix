import { CertificationPointOfContact } from '../../../../src/shared/domain/read-models/CertificationPointOfContact.js';
import {
  ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID,
  buildAllowedCertificationCenterAccess,
} from './build-allowed-certification-center-access.js';

const CERTIFICATION_POINT_OF_CONTACT_BUILDER_MEMBERSHIP_DEFAULT_ID = 1231;

const buildCertificationPointOfContact = function ({
  id = 123,
  firstName = 'Chèvre',
  lastName = 'Brebis',
  email = 'chevre.brebis@example.net',
  lang = 'fr',
  pixCertifTermsOfServiceAccepted = true,
  allowedCertificationCenterAccesses = [buildAllowedCertificationCenterAccess()],
  certificationCenterMemberships = [_buildCertificationCenterMembership({ userId: id })],
} = {}) {
  return new CertificationPointOfContact({
    id,
    firstName,
    lastName,
    email,
    lang,
    pixCertifTermsOfServiceAccepted,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
  });
};

function _buildCertificationCenterMembership({
  id = CERTIFICATION_POINT_OF_CONTACT_BUILDER_MEMBERSHIP_DEFAULT_ID,
  certificationCenterId = ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID,
  userId,
  role = 'MEMBER',
}) {
  return {
    id,
    certificationCenterId,
    userId,
    role,
  };
}

export { buildCertificationPointOfContact, CERTIFICATION_POINT_OF_CONTACT_BUILDER_MEMBERSHIP_DEFAULT_ID };
