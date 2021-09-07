const _ = require('lodash');
const buildBadge = require('./build-badge');
const buildAccreditation = require('./build-accreditation');
const databaseBuffer = require('../database-buffer');

module.exports = function buildAccreditedBadge({
  id = databaseBuffer.getNextId(),
  accreditationId,
  badgeId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  accreditationId = _.isNull(accreditationId) ? buildAccreditation().id : accreditationId;
  badgeId = _.isNull(badgeId) ? buildBadge().id : badgeId;

  const values = {
    id,
    accreditationId,
    badgeId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'accredited-badges',
    values,
  });
};
