const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getSessionCertificationCandidates({ userId, sessionId, sessionRepository, certificationCandidateRepository }) {
  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  } catch (err) {
    throw new UserNotAuthorizedToAccessEntity(sessionId);
  }

  return certificationCandidateRepository.findBySessionId(sessionId);
};
