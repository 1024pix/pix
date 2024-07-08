import { usecases } from '../../domain/usecases/index.js';
import * as toBePublishedSessionSerializer from '../../infrastructure/serializers/jsonapi/to-be-published-session-serializer.js';
import * as withRequiredActionSessionSerializer from '../../infrastructure/serializers/jsonapi/with-required-action-session-serializer.js';

const findFinalizedSessionsToPublish = async function (request, h, dependencies = { toBePublishedSessionSerializer }) {
  const { filter } = request.query;
  const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish(filter);
  return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
};

const findFinalizedSessionsWithRequiredAction = async function (
  request,
  h,
  dependencies = { withRequiredActionSessionSerializer },
) {
  const { filter } = request.query;
  const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction(filter);
  return dependencies.withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
};

const finalizedSessionController = { findFinalizedSessionsToPublish, findFinalizedSessionsWithRequiredAction };
export { finalizedSessionController };
