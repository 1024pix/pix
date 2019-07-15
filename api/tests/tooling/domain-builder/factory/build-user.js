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
    password = 'liuehrfi128743KUUKNSUkuz12Ukun',
    cgu = true,
    pixOrgaTermsOfServiceAccepted = false,
    pixCertifTermsOfServiceAccepted = false,
    hasSeenNewProfileInfo = false,
    pixRoles = [buildPixRole()],
    memberships = [buildMembership()],
    certificationCenterMemberships = [buildCertificationCenterMembership()]
  } = {}) {

  return new User({
    id, firstName, lastName, email, password, cgu, pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted, hasSeenNewProfileInfo, pixRoles, memberships,
    certificationCenterMemberships,
  });
};
