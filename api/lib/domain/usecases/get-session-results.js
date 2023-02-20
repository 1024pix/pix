export default async function getSessionResults({ sessionId, sessionRepository, certificationResultRepository }) {
  const session = await sessionRepository.get(sessionId);
  const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

  return { session, certificationResults };
}
