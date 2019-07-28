const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');
const buildSession = require('./build-session');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCandidate({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthCountry = faker.address.country(),
  birthProvince = faker.address.state(),
  birthCity = faker.address.city(),
  birthdate = moment(faker.date.past(10)).format('YYYY-MM-DD'),
  sessionId,
  externalId = faker.random.uuid(),
  createdAt = faker.date.past(),
  extraTimePercentage = 33.3,
} = {}) {

  sessionId = _.isNil(sessionId) ? buildSession().id : sessionId;

  const values = {
    id,
    firstName,
    lastName,
    birthCountry,
    birthProvince,
    birthCity,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-candidates',
    values,
  });
};
