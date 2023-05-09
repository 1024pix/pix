const publishSession = async function ({
  i18n,
  sessionId,
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
  publishedAt = new Date(),
}) {
  await sessionPublicationService.publishSession({
    i18n,
    sessionId,
    certificationRepository,
    certificationCenterRepository,
    finalizedSessionRepository,
    sessionRepository,
    publishedAt,
  });

  return sessionRepository.get(sessionId);
};

export { publishSession };
