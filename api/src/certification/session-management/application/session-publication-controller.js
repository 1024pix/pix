import { SessionPublicationBatchError } from '../../../shared/application/errors/http-errors.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../domain/usecases/index.js';
import * as sessionManagementSerializer from '../infrastructure/serializers/session-serializer.js';

async function publish(request, h) {
  const sessionId = request.params.id;

  await usecases.requestSessionPublication({ sessionId });

  return h.response().code(204);
}

async function unpublish(request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.sessionId;

  const session = await usecases.unpublishSession({ sessionId });

  return dependencies.sessionManagementSerializer.serialize({ session });
}

async function publishInBatch(request, h) {
  const sessionIds = request.payload.data.attributes.ids;
  const errors = await usecases.requestMultipleSessionPublication({ sessionIds });

  const sessionIdsInError = Object.keys(errors);

  if (sessionIdsInError.length > 0) {
    logger.warn('One or more error occurred when publishing session in batch');
    for (const sessionIdInError of Object.keys(errors)) {
      logger.warn({ sessionId: sessionIdInError }, errors[sessionIdInError].message);
    }
    throw new SessionPublicationBatchError();
  }
  return h.response().code(204);
}

export const sessionPublicationController = {
  publish,
  unpublish,
  publishInBatch,
};
