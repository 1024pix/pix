module.exports = async function addCertificationCandidateToSession({
  sessionId,
  certificationCandidate,
  certificationCandidateRepository
}) {
  certificationCandidate.sessionId = sessionId;
  certificationCandidate.validate();
  return certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId: certificationCandidate.sessionId });
};
