const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const moment = require('moment');

module.exports = function buildFinalizedSession({
  sessionId = faker.random.number(),
  certificationCenterName = faker.random.word(),
  finalizedAt = faker.date.recent(),
  isPublishable = faker.random.boolean(),
  time = '09:10:45',
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  publishedAt = null,
  assignedCertificationOfficerName = null,
} = {}) {

  const values = {
    sessionId,
    certificationCenterName,
    finalizedAt,
    isPublishable,
    time,
    date,
    publishedAt,
    assignedCertificationOfficerName,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'finalized-sessions',
    values,
    customIdKey: 'sessionId',
  });
};
