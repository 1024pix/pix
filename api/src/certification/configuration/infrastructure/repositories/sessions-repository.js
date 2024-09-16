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
