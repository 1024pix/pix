module.exports = async function publishSession({
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
  publishedAt = new Date(),
}) {

  return sessionPublicationService.publishSession({
    sessionId,
    certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
    publishedAt,
  });
};
