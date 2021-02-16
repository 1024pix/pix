module.exports = async function unpublishSession({
  sessionId,
  certificationRepository,
  sessionRepository,
  finalizedSessionRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);

  await certificationRepository.unpublishCertificationCoursesBySessionId(sessionId);

  session.publishedAt = null;

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt: session.publishedAt });

  await finalizedSessionRepository.updatePublishedAt({ sessionId, publishedAt: session.publishedAt });

  return sessionRepository.getWithCertificationCandidates(sessionId);
};
