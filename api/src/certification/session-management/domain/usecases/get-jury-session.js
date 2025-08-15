import * as injectedJurySessionRepository from '../../infrastructure/repositories/jury-session-repository.js'; /**
 * @typedef {import('./index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../models/JurySession.js').JurySession} JurySession
 */

/**
 * @param {Object} params
 * @param {JurySessionRepository} params.jurySessionRepository
 * @returns {JurySession}
 */
const getJurySession = async function ({ sessionId, jurySessionRepository = injectedJurySessionRepository } = {}) {
  return jurySessionRepository.get({ id: sessionId });
};

export { getJurySession };
