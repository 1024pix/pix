const getCleaCertifiedCandidateBySession = async function ({
  sessionId,
  cleaCertifiedCandidateRepository,
  sessionEnrolmentRepository,
}) {
  const cleaCertifiedCandidateData = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);
  const session = await sessionEnrolmentRepository.get({ id: sessionId });

  return { session, cleaCertifiedCandidateData };
};

export { getCleaCertifiedCandidateBySession };
