module.exports = async function getSessionCertificationCandidates({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionIdWithCertificationCourse(sessionId);
};
