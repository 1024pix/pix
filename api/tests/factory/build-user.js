const User = require('../../lib/domain/models/User');
const buildOrganizationAccess = require('./build-organization-access');
const buildPixRole = require('./build-pix-role');

module.exports = function buildUser(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
    password = 'liuehrfi128743KUUKNSUkuz12Ukun',
    cgu = true,
    pixRoles = [buildPixRole()],
    organizationAccesses = [buildOrganizationAccess()],
  } = {}) {

  return new User({
    id, firstName, lastName, email, password, cgu, pixRoles, organizationAccesses
  });
};
