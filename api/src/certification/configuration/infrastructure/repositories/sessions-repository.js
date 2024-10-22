/**
 * @typedef {import('./index.js').SessionsApi} SessionsApi
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DEFAULT_PAGINATION, fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {number} params.pageNumber - page number to fetch, default 1
 */
export const findStaleV2Sessions = async function ({ centerId, pageNumber = DEFAULT_PAGINATION.PAGE } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('sessions')
    .select('sessions.id')
    .innerJoin('certification-centers', function () {
      this.on('sessions.certificationCenterId', 'certification-centers.id').andOnVal(
        'sessions.certificationCenterId',
        centerId,
      );
    })
    .leftJoin('certification-courses', 'sessions.id', 'certification-courses.sessionId')
    .where('sessions.version', '=', 2)
    .whereNull('certification-courses.sessionId');

  const { results, pagination } = await fetchPage(query, { number: pageNumber });

  return { sessionIds: results.map(({ id }) => id), pagination };
};

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {number} params.pageNumber - page number to fetch, default 1
 * @param {SessionsApi} params.sessionsApi
 */
export const deleteUnstartedSession = async function ({ sessionId, sessionsApi } = {}) {
  try {
    await sessionsApi.deleteSession({ sessionId });
  } catch (error) {
    if (error.code === 'SESSION_STARTED_DELETION_ERROR') {
      return;
    }
    throw error;
  }
};

/**
 * @returns {Promise<number>} updated sessions count
 */
export const updateV2SessionsWithNoCourses = async function () {
  const knexConn = DomainTransaction.getConnection();

  const updatedSessions = await knexConn('sessions')
    .update({ version: 3 }, ['id'])
    .whereIn('id', function () {
      this.select('sessions.id')
        .from('sessions')
        .leftJoin('certification-courses', 'sessions.id', 'certification-courses.sessionId')
        .where('sessions.version', 2)
        .whereNull('certification-courses.sessionId')
        .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
        .where('certification-centers.isV3Pilot', true);
    });

  return updatedSessions.length;
};

/**
 * @returns {Promise<Array<number>>} ids of v2 sessions with no courses
 */
export const findV2SessionIdsWithNoCourses = async function () {
  const knexConn = DomainTransaction.getConnection();

  const sessions = await knexConn('sessions')
    .select('id')
    .whereIn('id', function () {
      this.select('sessions.id')
        .from('sessions')
        .leftJoin('certification-courses', 'sessions.id', 'certification-courses.sessionId')
        .where('sessions.version', 2)
        .whereNull('certification-courses.sessionId')
        .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
        .where('certification-centers.isV3Pilot', true);
    });

  return sessions.map(({ id }) => id);
};
