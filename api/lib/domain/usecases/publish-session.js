export default async function publishSession({
  sessionId,
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
  publishedAt = new Date(),
}) {
  await sessionPublicationService.publishSession({
    sessionId,
    certificationRepository,
    certificationCenterRepository,
    finalizedSessionRepository,
    sessionRepository,
    publishedAt,
  });

  return sessionRepository.get(sessionId);
}
