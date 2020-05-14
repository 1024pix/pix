const faker = require('faker');

const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Prescriber = require('../../../../lib/domain/read-models/Prescriber');

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildUser() {
  return new User({
    id: faker.random.number(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName()
  });
}

function _buildOrganization() {
  return new Organization({
    id: faker.random.number(),
    name: 'ACME',
    type: 'PRO',
    externalId: 'EXTID',
    isManagingStudents: false,
    canCollectProfiles: false,
  });
}

function _buildMemberships() {
  return [
    new Membership({
      id: faker.random.number(),
      user: _buildUser(),
      organization: _buildOrganization()
    })
  ];
}

function _buildUserOrgaSettings() {
  return new UserOrgaSettings({
    id: faker.random.number(),
    currentOrganization: _buildOrganization(),
    user: _buildUser()
  });
}

module.exports = function buildPrescriber(
  {
    id = faker.random.number(),
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    pixOrgaTermsOfServiceAccepted = false,
    memberships = _buildMemberships(),
    userOrgaSettings = _buildUserOrgaSettings()
  } = {}) {

  return new Prescriber({
    id, firstName, lastName,
    pixOrgaTermsOfServiceAccepted,
    memberships, userOrgaSettings
  });
};
