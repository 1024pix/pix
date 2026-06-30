const unpublishSession = async function ({
  sessionId,
  certificationRepository,
  sessionManagementRepository,
  finalizedSessionRepository,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });

  await certificationRepository.unpublishCertificationCoursesBySessionId({ sessionId });

  session.publishedAt = null;

  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt: session.publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId);

  return sessionManagementRepository.get({ id: sessionId });
};

export { unpublishSession };

async function _updateFinalizedSession(finalizedSessionRepository, sessionId) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.unpublish();
  await finalizedSessionRepository.save({ finalizedSession });
}
