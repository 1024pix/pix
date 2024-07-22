/**
 * @typedef {import('./index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('./index.js').SupervisorAccessRepository} SupervisorAccessRepository
 */

/**
 * @param {Object} params
 * @param {JurySessionRepository} params.jurySessionRepository
 * @param {SupervisorAccessRepository} params.supervisorAccessRepository
 */
const getJurySession = async function ({ sessionId, jurySessionRepository, supervisorAccessRepository }) {
  const jurySession = await jurySessionRepository.get({ id: sessionId });
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    jurySession,
    hasSupervisorAccess,
  };
};

export { getJurySession };
