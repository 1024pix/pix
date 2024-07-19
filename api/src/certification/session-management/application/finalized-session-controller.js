import { usecases } from '../domain/usecases/index.js';
import * as toBePublishedSessionSerializer from '../infrastructure/serializers/to-be-published-session-serializer.js';

const findFinalizedSessionsToPublish = async function (request, h, dependencies = { toBePublishedSessionSerializer }) {
  const { filter } = request.query;
  const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish(filter);
  return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
};

const finalizedSessionController = {
  findFinalizedSessionsToPublish,
};
export { finalizedSessionController };
