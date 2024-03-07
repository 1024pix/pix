const getCleaCertifiedCandidateBySession = async function ({
  sessionId,
  cleaCertifiedCandidateRepository,
  sessionRepository,
}) {
  const cleaCertifiedCandidateData = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);
  const session = await sessionRepository.get({ id: sessionId });

  return { session, cleaCertifiedCandidateData };
};

export { getCleaCertifiedCandidateBySession };
