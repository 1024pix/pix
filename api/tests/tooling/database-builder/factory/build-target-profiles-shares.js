const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfilesShare({
  id = faker.random.number(),
  targetProfileId = buildTargetProfile().id,
  organizationId = buildOrganization().id,
} = {}) {

  const values = {
    id,
    targetProfileId,
    organizationId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'target-profile-shares',
    values,
  });

  return values;
};
