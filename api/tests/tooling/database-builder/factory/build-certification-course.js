const faker = require('faker');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

module.exports = function buildCertificationCourse({
  id = faker.random.number(),
  userId = buildUser().id,
  completedAt = faker.date.recent().toISOString(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = faker.date.past(12).toLocaleDateString('fr-FR', options),
  birthplace = faker.address.city(),
  sessionId = buildSession().id,
  externalId = faker.random.uuid(),
  isPublished = faker.random.boolean(),
  createdAt = faker.date.past().toISOString(),
  updatedAt = faker.date.recent().toISOString(),
} = {}) {

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
    updatedAt,
    userId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });

  return values;
};
