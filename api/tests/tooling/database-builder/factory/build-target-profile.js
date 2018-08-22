const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildTargetProfile({
  id = faker.random.number(),
  name = faker.name.jobTitle(),
  isPublic = faker.random.boolean(),
  organizationId = buildOrganization().id,
} = {}) {

  const values = {
    id,
    name,
    isPublic,
    organizationId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });

  return values;
};
