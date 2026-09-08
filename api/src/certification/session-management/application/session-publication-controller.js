import { SessionPublicationBatchError } from '../../../shared/application/errors/http-errors.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../domain/usecases/index.js';
import * as sessionManagementSerializer from '../infrastructure/serializers/session-serializer.js';

async function publish(request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.id;

  const session = await usecases.publishSession({ sessionId });

  return dependencies.sessionManagementSerializer.serialize({ session });
}

async function unpublish(request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.sessionId;

  const session = await usecases.unpublishSession({ sessionId });

  return dependencies.sessionManagementSerializer.serialize({ session });
}

async function publishInBatch(request, h) {
  const sessionIds = request.payload.data.attributes.ids;

  const result = await usecases.publishSessionsInBatch({ sessionIds });

  if (result.hasPublicationErrors()) {
    _logSessionBatchPublicationErrors(result);
    throw new SessionPublicationBatchError(result.batchId);
  }
  return h.response().code(204);
}

export const sessionPublicationController = {
  publish,
  unpublish,
  publishInBatch,
};

function _logSessionBatchPublicationErrors(result) {
  logger.warn(`One or more error occurred when publishing session in batch ${result.batchId}`);

  const sessionAndError = result.publicationErrors;
  for (const sessionId in sessionAndError) {
    logger.warn(
      {
        batchId: result.batchId,
        sessionId,
      },
      sessionAndError[sessionId].message,
    );
  }
}
