module.exports = async function getSessionCertificationCandidates({ userId, sessionId, sessionRepository, certificationCandidateRepository }) {
  await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);

  return certificationCandidateRepository.findBySessionId(sessionId);
};
