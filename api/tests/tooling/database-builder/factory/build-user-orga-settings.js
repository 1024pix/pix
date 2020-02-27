const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const buildOrganization = require('./build-organization');
const _ = require('lodash');

module.exports = function buildUserOrgaSettings(
  {
    id,
    currentOrganizationId,
    userId,
  } = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  currentOrganizationId = _.isUndefined(currentOrganizationId) ? buildOrganization().id : currentOrganizationId;

  const values = {
    id,
    currentOrganizationId,
    userId
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user-orga-settings',
    values,
  });
};
