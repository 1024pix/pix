module.exports = async function getSession({ sessionId, sessionRepository, supervisorAccessRepository }) {
  const session = await sessionRepository.get(sessionId);
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    session,
    hasSupervisorAccess,
  };
};
