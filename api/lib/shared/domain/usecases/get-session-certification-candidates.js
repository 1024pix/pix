const getSessionCertificationCandidates = async function ({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionId(sessionId);
};

export { getSessionCertificationCandidates };
