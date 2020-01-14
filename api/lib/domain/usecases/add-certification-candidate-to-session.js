module.exports = async function addCertificationCandidateToSession({
  sessionId,
  certificationCandidate,
  certificationCandidateRepository
}) {
  certificationCandidate.sessionId = sessionId;
  certificationCandidate.validate();
  await certificationCandidateRepository.saveInSession({ certificationCandidate, sessionId: certificationCandidate.sessionId });
  return certificationCandidate;
};
