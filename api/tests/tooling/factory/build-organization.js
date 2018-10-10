const faker = require('faker');
const Organization = require('../../../lib/domain/models/Organization');
const User = require('../../../lib/domain/models/User');

module.exports = function buildOrganization(
  {
    id = faker.random.number(),
    code = 'EBG123',
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    user = new User(),
    targetProfileShares = [],
  } = {}) {
  return new Organization({ id, code, name, type, user, targetProfileShares });
};
