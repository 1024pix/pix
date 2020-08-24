const faker = require('faker');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfile({
  id,
  name = faker.name.jobTitle(),
  imageUrl = null,
  isPublic = faker.random.boolean(),
  organizationId,
  createdAt = faker.date.recent(),
  outdated = false,
} = {}) {

  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    name,
    imageUrl,
    isPublic,
    organizationId,
    createdAt,
    outdated,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
};
