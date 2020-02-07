const faker = require('faker');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const moment = require('moment');

module.exports = function buildCertificationCourse({
  id,
  userId,
  completedAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = moment(faker.date.past(12)).format('YYYY-MM-DD'),
  birthplace = faker.address.city(),
  sessionId,
  externalId = faker.random.uuid(),
  isPublished = faker.random.boolean(),
  isV2Certification = faker.random.boolean(),
  createdAt = faker.date.past(),
  examinerComment,
  hasSeenEndTestScreen,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;

  const values = {
    id,
    birthdate,
    birthplace,
    completedAt,
    updatedAt,
    createdAt,
    externalId,
    firstName,
    isPublished,
    lastName,
    sessionId,
    userId,
    isV2Certification,
    examinerComment,
    hasSeenEndTestScreen,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
};
