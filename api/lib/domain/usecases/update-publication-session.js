const { InvalidParametersForSessionPublication } = require('../../domain/errors');

module.exports = async function updatePublicationSession({
  sessionId,
  toPublish,
  certificationRepository,
  sessionRepository,
  publishedAt = new Date(),
}) {
  const integerSessionId = parseInt(sessionId);

  if (!Number.isFinite(integerSessionId) || (typeof toPublish !== 'boolean')) {
    throw new InvalidParametersForSessionPublication();
  }

  let session = await sessionRepository.get(sessionId);
  await certificationRepository.updatePublicationStatusesBySessionId(sessionId, toPublish);

  if (toPublish) {
    session = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });
  }

  return session;
};
