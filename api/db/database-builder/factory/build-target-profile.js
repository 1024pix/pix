const faker = require('faker');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfile({
  id,
  name = faker.name.jobTitle(),
  imageUrl = null,
  isPublic = faker.random.boolean(),
  ownerOrganizationId,
  createdAt = faker.date.recent(),
  outdated = false,
} = {}) {

  ownerOrganizationId = _.isUndefined(ownerOrganizationId) ? buildOrganization().id : ownerOrganizationId;

  const values = {
    id,
    name,
    imageUrl,
    isPublic,
    ownerOrganizationId,
    createdAt,
    outdated,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
};
