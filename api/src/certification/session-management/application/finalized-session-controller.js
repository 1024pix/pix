import * as toBePublishedSessionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/to-be-published-session-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const findFinalizedSessionsToPublish = async function (request, h, dependencies = { toBePublishedSessionSerializer }) {
  const { filter } = request.query;
  const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish(filter);
  return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
};

const finalizedSessionController = {
  findFinalizedSessionsToPublish,
};
export { finalizedSessionController };
