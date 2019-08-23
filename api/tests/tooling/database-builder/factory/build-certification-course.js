const faker = require('faker');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCertificationCourse({
  id,
  userId,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = faker.date.past(12),
  birthplace = faker.address.city(),
  sessionId,
  externalId = faker.random.uuid(),
  isPublished = faker.random.boolean(),
  isV2Certification = false,
  createdAt = faker.date.past(),
  updatedAt = faker.date.recent(),
  completedAt = faker.date.recent(),
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;
  sessionId = _.isNil(sessionId) ? buildSession().id : sessionId;

  const values = {
    id,
    userId,
    firstName,
    lastName,
    birthdate,
    birthplace,
    sessionId,
    externalId,
    isPublished,
    isV2Certification,
    createdAt,
    updatedAt,
    completedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
};
