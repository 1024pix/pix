import { usecases } from '../../domain/usecases/index.js';
import * as toBePublishedSessionSerializer from '../../infrastructure/serializers/jsonapi/to-be-published-session-serializer.js';
import * as withRequiredActionSessionSerializer from '../../infrastructure/serializers/jsonapi/with-required-action-session-serializer.js';

const findFinalizedSessionsToPublish = async function (request, h, dependencies = { toBePublishedSessionSerializer }) {
  const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
  return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
};

const findFinalizedSessionsWithRequiredAction = async function (
  request,
  h,
  dependencies = { withRequiredActionSessionSerializer },
) {
  const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
  return dependencies.withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
};

const finalizedSessionController = { findFinalizedSessionsToPublish, findFinalizedSessionsWithRequiredAction };
export { finalizedSessionController };
