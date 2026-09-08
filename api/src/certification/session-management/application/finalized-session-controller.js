import { usecases } from '../domain/usecases/index.js';
import * as toBePublishedSessionSerializer from '../infrastructure/serializers/to-be-published-session-serializer.js';
import * as withRequiredActionSessionSerializer from '../infrastructure/serializers/with-required-action-session-serializer.js';

async function findFinalizedSessionsToPublish(request, h, dependencies = { toBePublishedSessionSerializer }) {
  const { filter } = request.query;
  const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish(filter);
  return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
}

async function findFinalizedSessionsWithRequiredAction(
  request,
  h,
  dependencies = { withRequiredActionSessionSerializer },
) {
  const { filter } = request.query;
  const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction(filter);
  return dependencies.withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
}

export const finalizedSessionController = {
  findFinalizedSessionsToPublish,
  findFinalizedSessionsWithRequiredAction,
};
