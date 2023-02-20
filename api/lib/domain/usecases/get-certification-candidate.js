async function getCertificationCandidate({ userId, sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.getBySessionIdAndUserId({ userId, sessionId });
}

export default getCertificationCandidate;
