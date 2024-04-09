import { randomUUID } from 'node:crypto';

import { SessionPublicationBatchResult } from '../models/SessionPublicationBatchResult.js';

const publishSessionsInBatch = async function ({
  i18n,
  sessionIds,
  publishedAt = new Date(),
  batchId = randomUUID(),
  certificationCenterRepository,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    try {
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
    } catch (error) {
      result.addPublicationError(sessionId, error);
    }
  }
  return result;
};

export { publishSessionsInBatch };
