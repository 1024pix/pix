const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCandidate({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthCity = faker.address.city(),
  birthProvinceCode = faker.random.alphaNumeric(3),
  birthCountry = faker.address.country(),
  email = faker.internet.exampleEmail(),
  birthdate = moment(faker.date.past(30)).format('YYYY-MM-DD'),
  sessionId,
  externalId = faker.random.uuid(),
  createdAt = faker.date.past(),
  extraTimePercentage = 0.3,
  userId,
} = {}) {

  sessionId = _.isNil(sessionId) ? buildSession().id : sessionId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    firstName,
    lastName,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-candidates',
    values,
  });
};
