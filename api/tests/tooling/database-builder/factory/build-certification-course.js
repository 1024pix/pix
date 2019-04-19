const faker = require('faker');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCourse({
  id = faker.random.number(),
  userId,
  completedAt = faker.date.recent(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = faker.date.past(12),
  birthplace = faker.address.city(),
  sessionId,
  externalId = faker.random.uuid(),
  isPublished = faker.random.boolean(),
  createdAt = faker.date.past(),
} = {}) {

  userId = userId || buildUser().id;
  sessionId = sessionId || buildSession().id;

  const values = {
    id,
    birthdate,
    birthplace,
    completedAt,
    createdAt,
    externalId,
    firstName,
    isPublished,
    lastName,
    sessionId,
    userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });

  return values;
};
