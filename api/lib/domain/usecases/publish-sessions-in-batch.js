const uuidv4 = require('uuid/v4');
const { SessionPublicationBatchResult } = require('../models/SessionPublicationBatchResult');

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
