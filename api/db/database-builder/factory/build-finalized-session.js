const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const moment = require('moment');

module.exports = function buildFinalizedSession({
  sessionId = 1,
  certificationCenterName = faker.random.word(),
  finalizedAt = faker.date.recent(),
  isPublishable = faker.random.boolean(),
  time = faker.random.number({ min: 0, max: 23 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0'),
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  publishedAt = null,
} = {}) {

  const values = {
    sessionId,
    certificationCenterName,
    finalizedAt,
    isPublishable,
    time,
    date,
    publishedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'finalized-sessions',
    values,
    customIdKey: 'sessionId',
  });
};
