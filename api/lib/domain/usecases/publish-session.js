const publishSession = async function ({
  i18n,
  sessionId,
  publishedAt = new Date(),
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
}) {
  const session = await sessionPublicationService.publishSession({
    sessionId,
    publishedAt,
    certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
  });

  await sessionPublicationService.manageEmails({
    i18n,
    session,
    publishedAt,
    certificationCenterRepository,
    sessionRepository,
  });

  return sessionRepository.get(sessionId);
};

export { publishSession };
