const buildUser = require('./build-user');
const buildCertficationCenter = require('./build-certification-center');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');
const _ = require('lodash');

module.exports = function buildCertificationCenterMembership({
  id,
  userId,
  certificationCenterId,
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;
  certificationCenterId = _.isNil(certificationCenterId) ? buildCertficationCenter().id : certificationCenterId;

  const values = {
    id, userId, certificationCenterId
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });
};

