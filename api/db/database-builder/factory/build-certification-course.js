import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';

/**
 * @typedef {object} CertificationCourseRow
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthdate
 * @property {string} birthplace
 * @property {string | null} birthPostalCode
 * @property {string | null} birthINSEECode
 * @property {string} birthCountry
 * @property {string} sex
 * @property {string | null} externalId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {boolean} isPublished
 * @property {string} verificationCode
 * @property {AlgorithmEngineVersion} version
 * @property {number} userId
 * @property {number} sessionId
 * @property {number} maxReachableLevelOnCertificationDate
 * @property {boolean} isRejectedForFraud
 * @property {'candidate' | 'technical' | null} abortReason
 * @property {string} lang
 * @property {number | null} versionId
 * @property {number | null} candidateId
 * @property {Frameworks} framework
 * @property {Date | null} lastAnswerAt
 */

/**
 * Builds a certification course and pushes it into the database buffer.
 * If `userId` or `sessionId` are not provided, a user and/or a session are built as well.
 *
 * @param {undefined | object} params
 * @param {undefined | number} params.id
 * @param {undefined | string} params.lastName
 * @param {undefined | string} params.firstName
 * @param {undefined | string} params.birthdate
 * @param {undefined | string} params.birthplace
 * @param {undefined | string} params.sex
 * @param {undefined | string | null} params.birthPostalCode
 * @param {undefined | string | null} params.birthINSEECode
 * @param {undefined | string} params.birthCountry
 * @param {undefined | string | null} params.externalId
 * @param {undefined | Date} params.createdAt
 * @param {undefined | Date} params.updatedAt
 * @param {undefined | boolean} params.isPublished
 * @param {undefined | string} params.verificationCode
 * @param {undefined | AlgorithmEngineVersion} params.version
 * @param {undefined | number } params.userId
 * @param {undefined | number } params.sessionId
 * @param {undefined | number} params.maxReachableLevelOnCertificationDate
 * @param {undefined | boolean} params.isRejectedForFraud
 * @param {undefined | 'candidate' | 'technical' | null} params.abortReason
 * @param {undefined | string} params.lang
 * @param {undefined | number | null} params.versionId
 * @param {undefined | number | null} params.candidateId
 * @param {undefined | Frameworks} params.framework
 * @param {undefined | Date | null} params.lastAnswerAt
 * @returns {CertificationCourseRow}
 */
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
  userId = userId ?? buildUser().id;
  sessionId = sessionId ?? buildSession().id;
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
