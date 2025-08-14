import { randomUUID } from 'node:crypto';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCertificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as injectedSharedSessionRepository from '../../../shared/infrastructure/repositories/session-repository.js';
import { certificationRepository as injectedCertificationRepository } from '../../infrastructure/repositories/index.js';
import { SessionPublicationBatchResult } from '../models/SessionPublicationBatchResult.js';
import * as injectedSessionPublicationService from '../services/session-publication-service.js';

const publishSessionsInBatch = async function ({
  i18n,
  sessionIds,
  publishedAt = new Date(),
  batchId = randomUUID(),
  certificationCenterRepository = injectedCertificationCenterRepository,
  certificationRepository = injectedCertificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  sharedSessionRepository = injectedSharedSessionRepository,
  sessionPublicationService = injectedSessionPublicationService,
} = {}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    try {
      await DomainTransaction.execute(async () => {
        const session = await sessionPublicationService.publishSession({
          sessionId,
          publishedAt,
          certificationRepository,
          finalizedSessionRepository,
          sharedSessionRepository,
          sessionRepository,
        });

        await sessionPublicationService.manageEmails({
          i18n,
          session,
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
