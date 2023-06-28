const getJurySession = async function ({ sessionId, jurySessionRepository, supervisorAccessRepository }) {
  const jurySession = await jurySessionRepository.get(sessionId);
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    jurySession,
    hasSupervisorAccess,
  };
};

export { getJurySession };
