import { usecases } from '../../domain/usecases/index.js';
import * as withRequiredActionSessionSerializer from '../../infrastructure/serializers/jsonapi/with-required-action-session-serializer.js';

const findFinalizedSessionsWithRequiredAction = async function (
  request,
  h,
  dependencies = { withRequiredActionSessionSerializer },
) {
  const { filter } = request.query;
  const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction(filter);
  return dependencies.withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
};

const finalizedSessionController = { findFinalizedSessionsWithRequiredAction };
export { finalizedSessionController };
