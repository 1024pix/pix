const User = require('../../../../lib/domain/models/User');
const buildMembership = require('./build-membership');
const buildPixRole = require('./build-pix-role');

module.exports = function buildUser(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
    password = 'liuehrfi128743KUUKNSUkuz12Ukun',
    cgu = true,
    pixOrgaTermsOfServiceAccepted = false,
    pixRoles = [buildPixRole()],
    memberships = [buildMembership()],
  } = {}) {

  return new User({
    id, firstName, lastName, email, password, cgu, pixOrgaTermsOfServiceAccepted, pixRoles, memberships
  });
};
