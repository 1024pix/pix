const getSession = async function ({ sessionId, sessionRepository, supervisorAccessRepository }) {
  const session = await sessionRepository.get({ id: sessionId });
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    session,
    hasSupervisorAccess,
    hasSomeCleaAcquired,
  };
};

export { getSession };
