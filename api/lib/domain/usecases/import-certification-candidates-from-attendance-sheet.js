const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function importCertificationCandidatesFromAttendanceSheet({
  userId,
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  sessionRepository,
  certificationCandidateRepository,
}) {
  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  } catch (err) {
    throw new UserNotAuthorizedToAccessEntity(sessionId);
  }

  const certificationCandidates = await certificationCandidatesOdsService
    .extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });

  return certificationCandidateRepository.replaceBySessionId(sessionId, certificationCandidates);
};
