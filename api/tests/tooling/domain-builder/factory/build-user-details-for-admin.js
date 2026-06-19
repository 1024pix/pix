import { UserDetailsForAdmin } from '../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';
import { STATUS } from '../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';

const buildUserDetailsForAdmin = function ({
  id = 123,
  firstName = 'Louis',
  lastName = 'Philippe',
  email = 'louis.philippe@example.net',
  username = 'jean.bono1234',
  pixCertifTermsOfServiceAccepted = false,
  pixOrgaTermsOfServiceAccepted = false,
  isAuthenticatedFromGAR = false,
  createdAt,
  updatedAt,
  lang = 'fr',
  locale,
  lastPixOrgaTermsOfServiceValidatedAt,
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
} = {}) {
  const userDetailsForAdmin = new UserDetailsForAdmin({
    id,
    firstName,
    lastName,
    email,
    username,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    createdAt,
    updatedAt,
    lang,
    locale,
    lastPixOrgaTermsOfServiceValidatedAt,
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
  userDetailsForAdmin.tosStatus = { pixAppTosStatus };
  return userDetailsForAdmin;
};

export { buildUserDetailsForAdmin };
