const buildSession = require('./build-session');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCertificationCourse({
  id = databaseBuffer.getNextId(),
  lastName = 'last-name',
  firstName = 'first-name',
  birthdate = '2001-05-21',
  birthplace = 'Perpignan',
  externalId = 'externalId',
  hasSeenEndTestScreen = false,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
  completedAt = new Date('2020-03-01'),
  isPublished = true,
  verificationCode = `P-AB789TTY${id}`,
  isV2Certification = true,
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
