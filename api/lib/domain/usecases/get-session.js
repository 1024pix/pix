// @ts-check

/** @typedef {import('../models/SessionRepository')} SessionRepository */
/** @typedef {import('../../domain/models/Session')} Session */

/**
 * @param {Object} obj
 * @param {number} obj.sessionId
 * @param {SessionRepository} obj.sessionRepository
 *
 * @returns {Promise<Session>}
 */
module.exports = function getSession({ sessionId, sessionRepository }) {
  return sessionRepository.get(sessionId);
};
