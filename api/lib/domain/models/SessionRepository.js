// @ts-check

const { NotImplementedError } = require('../errors');

/** @typedef {import('./Session')} Session */

/** @interface */
class SessionRepository {
  /**
   * @param {number} _sessionId
   *
   * @returns {Promise<Session>}
   */
  async get(_sessionId) {
    throw new NotImplementedError();
  }
}

module.exports = SessionRepository;
