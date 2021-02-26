const faker = require('faker');

const User = require('../../../../lib/domain/models/User');

const buildMembership = require('./build-membership');
const buildPixRole = require('./build-pix-role');
const buildCertificationCenterMembership = require('./build-certification-center-membership');
const buildAuthenticationMethod = require('./build-authentication-method');

module.exports = function buildUser({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  username,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  isAnonymous = false,
  pixRoles = [buildPixRole()],
  memberships = [buildMembership()],
  certificationCenterMemberships = [buildCertificationCenterMembership()],
  authenticationMethods = [buildAuthenticationMethod()],
} = {}) {

  return new User({
    id, firstName, lastName, email, username,
    cgu,
    lang,
    lastTermsOfServiceValidatedAt, mustValidateTermsOfService,
    pixOrgaTermsOfServiceAccepted, pixCertifTermsOfServiceAccepted,
    hasSeenAssessmentInstructions, isAnonymous,
    pixRoles, memberships, certificationCenterMemberships,
    authenticationMethods,
  });
};
