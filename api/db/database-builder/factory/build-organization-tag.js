const databaseBuffer = require('../database-buffer');
const buildOrganization = require('./build-organization');
const buildTag = require('./build-tag');
const _ = require('lodash');

module.exports = function buildOrganizationTag({
  id = databaseBuffer.getNextId(),
  organizationId,
  tagId,
} = {}) {

  tagId = _.isUndefined(tagId) ? buildTag().id : tagId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    organizationId,
    tagId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-tags',
    values,
  });
};
