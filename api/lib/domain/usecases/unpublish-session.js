const unpublishSession = async function ({
  sessionId,
  certificationRepository,
  sessionRepository,
  finalizedSessionRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates({ id: sessionId });

  await certificationRepository.unpublishCertificationCoursesBySessionId(sessionId);

  session.publishedAt = null;

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt: session.publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId);

  return sessionRepository.getWithCertificationCandidates({ id: sessionId });
};

export { unpublishSession };

async function _updateFinalizedSession(finalizedSessionRepository, sessionId) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.unpublish();
  await finalizedSessionRepository.save({ finalizedSession });
}
