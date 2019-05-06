const faker = require('faker');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfile({
  id = faker.random.number(),
  name = faker.name.jobTitle(),
  isPublic = faker.random.boolean(),
  organizationId,
} = {}) {

  organizationId = organizationId || buildOrganization().id;

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
