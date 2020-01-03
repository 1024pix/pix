const buildCertificationCenter = require('./build-certification-center');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const faker = require('faker');

module.exports = function buildCertificationCenterMembership({
  id,
  userId,
  certificationCenterId,
  createdAt = faker.date.past(),
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

