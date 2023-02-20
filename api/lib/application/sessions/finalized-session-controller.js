import usecases from '../../domain/usecases';
import toBePublishedSessionSerializer from '../../infrastructure/serializers/jsonapi/to-be-published-session-serializer';
import withRequiredActionSessionSerializer from '../../infrastructure/serializers/jsonapi/with-required-action-session-serializer';

export default {
  async findFinalizedSessionsToPublish() {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
    return withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
  },
};
