import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../errors.js';
import { SessionPublicationBatchResult } from '../models/SessionPublicationBatchResult.js';

export async function sessionsPublicationRequest({
  sessionIds,
  batchId = randomUUID(),
  sessionManagementRepository,
  publishSessionJobRepository,
}) {
  const result = new SessionPublicationBatchResult(batchId);
  for (const sessionId of sessionIds) {
    const session = await sessionManagementRepository.get({ id: sessionId });

    if (!session) {
      result.addPublicationError(sessionId, new NotFoundError(`Session id ${sessionId} not found`));
      continue;
    }

    if (session.isPublished()) {
      result.addPublicationError(
        sessionId,
        new SessionAlreadyPublishedError(`Session id ${sessionId} is already published`),
      );
      continue;
    }

    await publishSessionJobRepository.performAsync({ sessionId });
  }
  return result;
}
