const usecases = require('../../domain/usecases/index.js');
const toBePublishedSessionSerializer = require('../../infrastructure/serializers/jsonapi/to-be-published-session-serializer');
const withRequiredActionSessionSerializer = require('../../infrastructure/serializers/jsonapi/with-required-action-session-serializer');

module.exports = {
  async findFinalizedSessionsToPublish() {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
    return withRequiredActionSessionSerializer.serialize(finalizedSessionsWithRequiredAction);
  },
};
