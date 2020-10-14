const faker = require('faker');
const { isUndefined } = require('lodash');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

module.exports = function buildUserDetailsForAdmin(
  {
    id = faker.random.number(),
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    email,
    username = 'jean.bono1234',
    cgu = true,
    pixCertifTermsOfServiceAccepted = false,
    pixOrgaTermsOfServiceAccepted = false,
    isAuthenticatedFromGAR = false,
    isAssociatedWithSchoolingRegistration = false,
  } = {}) {

  email = isUndefined(email) ? faker.internet.exampleEmail(firstName, lastName).toLowerCase() : email || null;

  return new UserDetailsForAdmin({
    id, firstName, lastName, email, username,
    cgu, pixOrgaTermsOfServiceAccepted, pixCertifTermsOfServiceAccepted,
    isAuthenticatedFromGAR, isAssociatedWithSchoolingRegistration,
  });
};
