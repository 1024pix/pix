import _ from 'lodash';

import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';

export function buildCertificationCourse({
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
  createdAt = new Date('2022-01-01'),
  updatedAt = new Date('2022-02-01'),
  isPublished = true,
  verificationCode = `P-${id}`.padEnd(10, '3'),
  version = AlgorithmEngineVersion.V2,
  userId,
  sessionId,
  maxReachableLevelOnCertificationDate = 5,
  isRejectedForFraud = false,
  abortReason = null,
  lang = 'fr-fr',
  versionId = null,
  candidateId = null,
  framework = Frameworks.CORE,
  lastAnswerAt = null,
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
    createdAt,
    updatedAt,
    isPublished,
    verificationCode,
    version,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
    isRejectedForFraud,
    abortReason,
    lang,
    versionId,
    candidateId,
    framework,
    lastAnswerAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses',
    values,
  });
}
