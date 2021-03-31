const _ = require('lodash');
const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCandidate({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  lastName = 'last-name',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'somemail@example.net',
  birthdate = '2000-01-04',
  resultRecipientEmail = 'somerecipientmail@example.net',
  sessionId,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  extraTimePercentage = 0.3,
  userId,
  schoolingRegistrationId,
} = {}) {

  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    firstName,
    lastName,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    userId,
    schoolingRegistrationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-candidates',
    values,
  });
};
