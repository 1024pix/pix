const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

module.exports = function buildUserDetailsForAdmin({
  id = 123,
  firstName = 'Louis',
  lastName = 'Philippe',
  email = 'louis.philippe@example.net',
  username = 'jean.bono1234',
  cgu = true,
  pixCertifTermsOfServiceAccepted = false,
  pixOrgaTermsOfServiceAccepted = false,
  isAuthenticatedFromGAR = false,
  schoolingRegistrations = [],
} = {}) {

  return new UserDetailsForAdmin({
    id, firstName, lastName, email, username,
    cgu, pixOrgaTermsOfServiceAccepted, pixCertifTermsOfServiceAccepted,
    isAuthenticatedFromGAR, schoolingRegistrations,
  });
};
