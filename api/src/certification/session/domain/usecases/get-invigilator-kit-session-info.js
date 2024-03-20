/**
 * @typedef {import('./index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 */

/**
 * @param {Object} params
 * @param {SessionForInvigilatorKitRepository} params.sessionForInvigilatorKitRepository
 */
const getInvigilatorKitSessionInfo = async function ({ sessionId, sessionForInvigilatorKitRepository }) {
  return sessionForInvigilatorKitRepository.get({ id: sessionId });
};

export { getInvigilatorKitSessionInfo };
