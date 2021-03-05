const uuidv4 = require('uuid/v4');

module.exports = async function publishSessionsInBatch({
  sessionIds,
  certificationRepository,
  finalizedSessionRepository,
  sessionPublicationService,
  sessionRepository,
  publishedAt = new Date(),
  batchId = uuidv4(),
}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    try {
      await sessionPublicationService.publishSession({
        sessionId,
        certificationRepository,
        finalizedSessionRepository,
        sessionRepository,
        publishedAt,
      });
    } catch (error) {
      result.addPublicationError(sessionId, error);
    }
  }
  return result;
};

class SessionPublicationBatchResult {
  constructor(batchId) {
    this.batchId = batchId;
    this.publicationErrors = {};
  }
  hasPublicationErrors() {
    return Boolean(Object.keys(this.publicationErrors).length);
  }
  addPublicationError(sessionId, error) {
    this.publicationErrors[sessionId] = error;
  }
}
