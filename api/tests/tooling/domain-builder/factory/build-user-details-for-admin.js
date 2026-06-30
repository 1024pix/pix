import { UserDetailsForAdmin } from '../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';
import { STATUS } from '../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';

const buildUserDetailsForAdmin = function ({
  id = 123,
  firstName = 'Louis',
  lastName = 'Philippe',
  email = 'louis.philippe@example.net',
  username = 'jean.bono1234',
  pixCertifTermsOfServiceAccepted = false,
  isAuthenticatedFromGAR = false,
  createdAt,
  updatedAt,
  lang = 'fr',
  locale,
  lastPixCertifTermsOfServiceValidatedAt,
  lastLoggedAt,
  emailConfirmedAt,
  organizationLearners = [],
  authenticationMethods = [],
  userLogin = [],
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  isPixAgent = false,
  lastApplicationConnections,
  pixAppTosStatus = { status: STATUS.ACCEPTED, acceptedAt: null },
  pixOrgaTosStatus = { status: STATUS.ACCEPTED, acceptedAt: null },
} = {}) {
  const userDetailsForAdmin = new UserDetailsForAdmin({
    id,
    firstName,
    lastName,
    email,
    username,
    pixCertifTermsOfServiceAccepted,
    createdAt,
    updatedAt,
    lang,
    locale,
    lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt,
    emailConfirmedAt,
    isAuthenticatedFromGAR,
    organizationLearners,
    authenticationMethods,
    userLogin,
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
    isPixAgent,
    lastApplicationConnections,
  });
  userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });
  return userDetailsForAdmin;
};

export { buildUserDetailsForAdmin };
