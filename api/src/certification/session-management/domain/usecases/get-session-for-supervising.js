/**
 * @typedef {import('./index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 */

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {SessionForSupervisingRepository} params.sessionForSupervisingRepository
 */
const getSessionForSupervising = async function ({ sessionId, sessionForSupervisingRepository }) {
  return sessionForSupervisingRepository.get({ id: sessionId });
};

export { getSessionForSupervising };
