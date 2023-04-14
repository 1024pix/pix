const usecases = require('../../domain/usecases/index.js');
const toBePublishedSessionSerializer = require('../../infrastructure/serializers/jsonapi/to-be-published-session-serializer.js');
const withRequiredActionSessionSerializer = require('../../infrastructure/serializers/jsonapi/with-required-action-session-serializer.js');

module.exports = {
  async findFinalizedSessionsToPublish(request, h, dependencies = { toBePublishedSessionSerializer }) {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return dependencies.toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
  },

  async findFinalizedSessionsWithRequiredAction(request, h, dependencies = { withRequiredActionSessionSerializer }) {
    const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
    return dependencies.withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
  },
};
