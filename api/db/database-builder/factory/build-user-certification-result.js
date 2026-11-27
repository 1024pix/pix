import { databaseBuffer } from '../database-buffer.ts';

/**
 * @typedef {object} UserCertificationResultRow
 * @property {string} certificationResultId
 * @property {number} userId
 * @property {number | null} sessionId
 * @property {number | null} certificationCourseId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Builds a user certification result and pushes it into the database buffer.
 *
 * @param {undefined | object} params
 * @param {string} params.certificationResultId
 * @param {number} params.userId
 * @param {undefined | number | null} params.sessionId
 * @param {undefined | number | null} params.certificationCourseId
 * @param {undefined | Date} params.createdAt
 * @param {undefined | Date} params.updatedAt
 * @returns {UserCertificationResultRow}
 */
export function buildUserCertificationResult({
  certificationResultId,
  userId,
  sessionId = null,
  certificationCourseId = null,
  organizationLearnerId = null,
  createdAt = new Date('2022-01-01'),
  updatedAt = new Date('2022-02-01'),
} = {}) {
  const values = {
    certificationResultId,
    userId,
    sessionId,
    certificationCourseId,
    organizationLearnerId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user_certification_results',
    values,
  });
}
