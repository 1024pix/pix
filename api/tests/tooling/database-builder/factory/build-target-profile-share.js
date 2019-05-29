const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfileShare({
  id,
  targetProfileId,
  organizationId,
} = {}) {

  targetProfileId = _.isNil(targetProfileId) ? buildTargetProfile().id : targetProfileId;
  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    targetProfileId,
    organizationId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-shares',
    values,
  });
};
