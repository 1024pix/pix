const faker = require('faker');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');

function _buildMember(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
  } = {}) {

  return new User({ id, firstName, lastName, email });
}

function buildOrganization(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    createdAt = new Date('2018-01-12T01:02:03Z'),
    user = null,
    memberships = [],
    targetProfileShares = []
  } = {}) {
  return new Organization({ id, code, name, type, logoUrl, createdAt, user, memberships, targetProfileShares });
}

buildOrganization.withUser = function(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    createdAt = new Date('2018-01-12T01:02:03Z'),
    user = _buildMember()
  } = {}
) {
  return new Organization({ id, code, name, type, logoUrl, createdAt, user });
};

buildOrganization.withMembers = function(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    createdAt = new Date('2018-01-12T01:02:03Z'),
    members = [
      _buildMember({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }),
      _buildMember({ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }),
    ]
  } = {}
) {
  return new Organization({ id, code, name, type, logoUrl, createdAt, members });
};

module.exports = buildOrganization;
