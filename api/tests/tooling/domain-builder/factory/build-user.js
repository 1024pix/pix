const User = require('../../../../lib/domain/models/User');
const buildMembership = require('./build-membership');
const buildPixRole = require('./build-pix-role');
const buildCertificationCenterMembership = require('./build-certification-center-membership');

module.exports = function buildUser(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
    username = 'jean.bono1234',
    password = 'liuehrfi128743KUUKNSUkuz12Ukun',
    cgu = true,
    pixOrgaTermsOfServiceAccepted = false,
    pixCertifTermsOfServiceAccepted = false,
    hasSeenAssessmentInstructions = false,
    pixRoles = [buildPixRole()],
    memberships = [buildMembership()],
    certificationCenterMemberships = [buildCertificationCenterMembership()],
    shouldChangePassword = false
  } = {}) {

  return new User({
    id, firstName, lastName, email, username, password, cgu, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenAssessmentInstructions, shouldChangePassword,
    pixRoles, memberships, certificationCenterMemberships,
  });
};
