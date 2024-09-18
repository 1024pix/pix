/**
 * @typedef {import ('./index.js').SessionsRepository} SessionsRepository
 */

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {SessionsRepository} params.sessionsRepository
 */
export const deleteUnstartedSessions = async ({ centerId, sessionsRepository }) => {
  let numberOfSessions = 0;
  let hasNext = false;
  let pageNumber = 1;

  do {
    const { sessionIds, pagination } = await sessionsRepository.findStaleV2Sessions({ centerId, pageNumber });
    numberOfSessions = pagination.rowCount;
    hasNext = sessionIds.length;
    pageNumber++;

    await _deleteSessions({ sessionIds, sessionsRepository });
  } while (hasNext);

  return numberOfSessions;
};

/**
 * @param {Object} params
 * @param {SessionsRepository} params.sessionsRepository
 */
const _deleteSessions = async ({ sessionIds, sessionsRepository }) => {
  for (const sessionId of sessionIds) {
    await sessionsRepository.deleteUnstartedSession({ sessionId });
  }
};
