export async function getCleaCertifiedCandidateBySession({
  sessionId,
  cleaCertifiedCandidateRepository,
  sessionEnrolmentRepository,
}) {
  const cleaCertifiedCandidateData = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);
  const session = await sessionEnrolmentRepository.get({ id: sessionId });

  return { session, cleaCertifiedCandidateData };
}
