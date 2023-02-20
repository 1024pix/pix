export default async function getSession({ sessionId, sessionRepository, supervisorAccessRepository }) {
  const session = await sessionRepository.get(sessionId);
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    session,
    hasSupervisorAccess,
    hasSomeCleaAcquired,
  };
}
