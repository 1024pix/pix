module.exports = async function publishSessionsInBatch({
  sessionIds,
  certificationRepository,
  finalizedSessionRepository,
  sessionPublicationService,
  sessionRepository,
  publishedAt = new Date(),
}) {
  const publicationErrors = [];

  for (const sessionId of sessionIds) {
    try {
      await sessionPublicationService.publishSession({
        sessionId,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        publishedAt,
      });
    }
    catch (error) {
      publicationErrors.push(error);
    }
  }
};
