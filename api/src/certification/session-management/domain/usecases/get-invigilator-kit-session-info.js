/**
 * @typedef {import('./index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 */

/**
 * @param {object} params
 * @param {SessionForInvigilatorKitRepository} params.sessionForInvigilatorKitRepository
 */
export async function getInvigilatorKitSessionInfo({ sessionId, sessionForInvigilatorKitRepository }) {
  return sessionForInvigilatorKitRepository.get({ id: sessionId });
}
