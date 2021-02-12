const User = require('../../../../lib/domain/models/User');

const buildMembership = require('./build-membership');
const buildPixRole = require('./build-pix-role');
const buildCertificationCenterMembership = require('./build-certification-center-membership');
const buildAuthenticationMethod = require('./build-authentication-method');

module.exports = function buildUser({
  id = 123,
  firstName = 'Lorie',
  lastName = 'MeilleureAmie',
  email = 'jeseraila@example.net',
  username,
  cgu = true,
  lang = 'fr',
  lastTermsOfServiceValidatedAt = null,
  mustValidateTermsOfService = false,
  pixOrgaTermsOfServiceAccepted = false,
  pixCertifTermsOfServiceAccepted = false,
  hasSeenAssessmentInstructions = false,
  hasSeenNewLevelInfo = false,
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
    hasSeenAssessmentInstructions, hasSeenNewLevelInfo, isAnonymous,
    pixRoles, memberships, certificationCenterMemberships,
    authenticationMethods,
  });
};
