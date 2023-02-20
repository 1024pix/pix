export default async function getJurySession({ sessionId, jurySessionRepository, supervisorAccessRepository }) {
  const jurySession = await jurySessionRepository.get(sessionId);
  const hasSupervisorAccess = await supervisorAccessRepository.sessionHasSupervisorAccess({ sessionId });
  return {
    jurySession,
    hasSupervisorAccess,
  };
}
