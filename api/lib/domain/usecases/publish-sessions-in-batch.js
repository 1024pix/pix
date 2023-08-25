import { randomUUID } from 'crypto';

import { SessionPublicationBatchResult } from '../models/SessionPublicationBatchResult.js';

const publishSessionsInBatch = async function ({
  i18n,
  sessionIds,
  certificationCenterRepository,
  certificationRepository,
  finalizedSessionRepository,
  sessionPublicationService,
  sessionRepository,
  publishedAt = new Date(),
  batchId = randomUUID(),
}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    try {
      await sessionPublicationService.publishSession({
        i18n,
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

export { publishSessionsInBatch };
