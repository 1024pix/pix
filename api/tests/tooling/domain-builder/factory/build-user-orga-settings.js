const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildUser() {
  return new User({
    id: 123,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net',
  });
}

function _buildOrganization() {
  return new Organization({
    id: 456,
    name: 'ACME',
    type: 'PRO',
    code: 'ABCD12',
    externalId: 'EXTID',
    isManagingStudents: false,
    canCollectProfiles: false,
  });
}

module.exports = function buildUserOrgaSettings({
  id = 789,
  currentOrganization = _buildOrganization(),
  user = _buildUser(),
} = {}) {

  const userOrgaSettings = new UserOrgaSettings({ id, currentOrganization, user });

  userOrgaSettings.user.userOrgaSettings = userOrgaSettings;

  return userOrgaSettings;
};
