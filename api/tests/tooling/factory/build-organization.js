const faker = require('faker');
const Organization = require('../../../lib/domain/models/Organization');
const User = require('../../../lib/domain/models/User');

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
    createdAt = new Date('2018-01-12'),
    user = null,
    members = [],
    targetProfileShares = []
  } = {}) {
  return new Organization({ id, code, name, type, createdAt, user, members, targetProfileShares });
}

buildOrganization.withUser = function(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    createdAt = new Date('2018-01-12'),
    user = _buildMember()
  } = {}
) {
  return new Organization({ id, code, name, type, createdAt, user });
};

buildOrganization.withMembers = function(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    createdAt = new Date('2018-01-12'),
    members = [
      _buildMember({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }),
      _buildMember({ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }),
    ]
  } = {}
) {
  return new Organization({ id, code, name, type, createdAt, members });
};

module.exports = buildOrganization;
