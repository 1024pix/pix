const faker = require('faker');
const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');

module.exports = function buildSnapshot({
  id = faker.random.number(),
  profile = '{}',
  organizationId = buildOrganization().id,
  userId = buildUser().id,
  createdAt = faker.date.recent(),
} = {}) {

  const values = {
    id, profile, organizationId, userId, createdAt
  };

  databaseBuffer.pushInsertable({
    tableName: 'snapshots',
    values,
  });

  return values;
};
