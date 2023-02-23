const { v4: uuidv4 } = require('uuid');
const { SessionPublicationBatchResult } = require('../models/SessionPublicationBatchResult.js');

module.exports = async function publishSessionsInBatch({
  sessionIds,
  certificationCenterRepository,
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
        certificationCenterRepository,
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
