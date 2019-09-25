module.exports = async function importCertificationCandidatesFromAttendanceSheet({
  userId,
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  sessionRepository,
  certificationCandidateRepository,
}) {
  await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);

  const certificationCandidates = await certificationCandidatesOdsService
    .extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });

  return certificationCandidateRepository.replaceBySessionId(sessionId, certificationCandidates);
};
