module.exports = async function unpublishSession({
  sessionId,
  certificationRepository,
  sessionRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);

  await certificationRepository.unpublishCertificationCoursesBySessionId(sessionId);

  return session;
};
