const faker = require('faker');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildUser() {
  return new User({
    id: faker.random.number(),
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net'
  });
}

function _buildOrganization() {
  return new Organization({
    id: faker.random.number(),
    name: 'ACME',
    type: 'PRO',
    code: 'ABCD12',
    externalId: 'EXTID',
    isManagingStudents: false,
  });
}

module.exports = function buildUserOrgaSettings(
  {
    id = faker.random.number(),
    currentOrganization = _buildOrganization(),
    user = _buildUser(),
  } = {}) {

  const userOrgaSettings = new UserOrgaSettings({ id, currentOrganization, user });

  userOrgaSettings.user.userOrgaSettings = userOrgaSettings;

  return userOrgaSettings;
};
