import { databaseBuffer } from '../database-buffer.ts';

/**
 * @typedef {object} UserCertificationResultRow
 * @property {string} certificationResultId
 * @property {number} userId
 * @property {number | null} sessionId
 * @property {number | null} certificationCourseId
 */

/**
 * Builds a user certification result and pushes it into the database buffer.
 *
 * @param {undefined | object} params
 * @param {string} params.certificationResultId
 * @param {number} params.userId
 * @param {undefined | number | null} params.sessionId
 * @param {undefined | number | null} params.certificationCourseId
 * @returns {UserCertificationResultRow}
 */
export function buildUserCertificationResult({
  certificationResultId,
  userId,
  sessionId = null,
  certificationCourseId = null,
} = {}) {
  const values = {
    certificationResultId,
    userId,
    sessionId,
    certificationCourseId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user_certification_results',
    values,
  });
}
