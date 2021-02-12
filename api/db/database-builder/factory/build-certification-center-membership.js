const _ = require('lodash');
const databaseBuffer = require('../database-buffer');
const buildCertificationCenter = require('./build-certification-center');
const buildUser = require('./build-user');

module.exports = function buildCertificationCenterMembership({
  id = databaseBuffer.getNextId(),
  userId,
  certificationCenterId,
  createdAt = new Date('2020-01-01'),
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  certificationCenterId = _.isUndefined(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;

  const values = {
    id,
    userId,
    certificationCenterId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });
};

