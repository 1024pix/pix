const buildUser = require('./build-user');
const buildCertficationCenter = require('./build-certification-center');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildCertificationCenterMembership({
  id = faker.random.number(),
  userId,
  certificationCenterId,
} = {}) {

  userId = userId || buildUser().id;
  certificationCenterId = certificationCenterId || buildCertficationCenter().id;

  const values = {
    id, userId, certificationCenterId
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });

  return values;
};

