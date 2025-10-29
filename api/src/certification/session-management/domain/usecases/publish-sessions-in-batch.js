import { randomUUID } from 'node:crypto';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionPublicationBatchResult } from '../models/SessionPublicationBatchResult.js';

const publishSessionsInBatch = async function ({
  sessionIds,
  publishedAt = new Date(),
  batchId = randomUUID(),
  certificationCenterRepository,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  sharedSessionRepository,
  sessionPublicationService,
  pixPlusCertificationRepository,
}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    try {
      await DomainTransaction.execute(async () => {
        const { session, startedCertificationCoursesUserIds } = await sessionPublicationService.publishSession({
          sessionId,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sharedSessionRepository,
          sessionRepository,
          pixPlusCertificationRepository,
        });

        await sessionPublicationService.manageEmails({
          session,
          startedCertificationCoursesUserIds,
          publishedAt,
          certificationCenterRepository,
          sessionRepository,
        });
      });
    } catch (error) {
      result.addPublicationError(sessionId, error);
    }
  }
  return result;
};

export { publishSessionsInBatch };
