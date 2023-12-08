import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildCertificationCourse = function ({
  id = databaseBuffer.getNextId(),
  lastName = 'last-name',
  firstName = 'first-name',
  birthdate = '2001-05-21',
  birthplace = 'Paris',
  sex = 'F',
  birthPostalCode = null,
  birthINSEECode = '75101',
  birthCountry = 'FRANCE',
  externalId = 'externalId',
  hasSeenEndTestScreen = false,
  createdAt = new Date('2022-01-01'),
  updatedAt = new Date('2022-02-01'),
  completedAt = new Date('2022-03-01'),
  isPublished = true,
  verificationCode = `P-AB789TTY${id}`,
  version = 2,
  userId,
  sessionId,
  maxReachableLevelOnCertificationDate = 5,
  isCancelled = false,
  isRejectedForFraud = false,
  abortReason = null,
  pixCertificationStatus = null,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;
  const values = {
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    externalId,
    hasSeenEndTestScreen,
    createdAt,
    updatedAt,
    completedAt,
    isPublished,
    verificationCode,
    version,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
    isCancelled,
    isRejectedForFraud,
    abortReason,
    pixCertificationStatus,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
};

export { buildCertificationCourse };
