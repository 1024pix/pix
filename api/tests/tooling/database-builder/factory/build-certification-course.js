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
  examinerComment = faker.lorem.sentence(),
  hasSeenEndTestScreen = false,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
  completedAt = faker.date.recent(),
  isPublished = faker.random.boolean(),
  isV2Certification = faker.random.boolean(),
  userId,
  sessionId,
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
    examinerComment,
    hasSeenEndTestScreen,
    createdAt,
    updatedAt,
    completedAt,
    isPublished,
    isV2Certification,
    userId,
    sessionId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
};
