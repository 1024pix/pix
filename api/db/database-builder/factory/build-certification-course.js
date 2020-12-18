const faker = require('faker');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const moment = require('moment');

module.exports = function buildCertificationCourse({
  id,
  lastName = faker.name.lastName(),
  firstName = faker.name.firstName(),
  birthdate = moment(faker.date.past(12)).format('YYYY-MM-DD'),
  birthplace = faker.address.city(),
  externalId = faker.random.uuid(),
  hasSeenEndTestScreen = false,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
  completedAt = faker.date.recent(),
  isPublished = faker.random.boolean(),
  verificationCode = `P-${faker.random.alphaNumeric(8).toUpperCase()}`,
  isV2Certification = faker.random.boolean(),
  userId,
  sessionId,
  maxReachableLevelOnCertificationDate = 5,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;
  const values = {
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    externalId,
    hasSeenEndTestScreen,
    createdAt,
    updatedAt,
    completedAt,
    isPublished,
    verificationCode,
    isV2Certification,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
};
