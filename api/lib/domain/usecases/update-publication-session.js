module.exports = async function updatePublicationSession({
  sessionId,
  toPublish,
  certificationRepository,
  sessionRepository,
  publishedAt = new Date(),
}) {
  await certificationRepository.updatePublicationStatusesBySessionId(sessionId, toPublish);
  if (toPublish) {
    const session = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });
    return { publishedAtUpdated: true, session };
  }
  const session = await sessionRepository.get(sessionId);
  return { publishedAtUpdated: false, session };
};
