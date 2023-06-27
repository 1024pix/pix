const getSession = async function ({ sessionId, sessionRepository, supervisorAccessRepository }) {
  const session = await sessionRepository.get(sessionId);
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    session,
    hasSupervisorAccess,
    hasSomeCleaAcquired,
  };
};

export { getSession };
