/**
 * @typedef {import('./index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../models/JurySession.js').JurySession} JurySession
 */

/**
 * @param {object} params
 * @param {JurySessionRepository} params.jurySessionRepository
 * @returns {JurySession}
 */
export async function getJurySession({ sessionId, jurySessionRepository }) {
  return jurySessionRepository.get({ id: sessionId });
}
