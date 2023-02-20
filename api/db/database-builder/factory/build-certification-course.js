import buildSession from './build-session';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildCertificationCourse({
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
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
  completedAt = new Date('2020-03-01'),
  isPublished = true,
  verificationCode = `P-AB789TTY${id}`,
  isV2Certification = true,
  userId,
  sessionId,
  maxReachableLevelOnCertificationDate = 5,
  isCancelled = false,
  abortReason = null,
  cpfFilename = null,
  cpfImportStatus = null,
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
    isV2Certification,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
    isCancelled,
    abortReason,
    cpfFilename,
    cpfImportStatus,
    pixCertificationStatus,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
}
