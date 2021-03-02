const usecases = require('../../domain/usecases');
const toBePublishedSessionSerializer = require('../../infrastructure/serializers/jsonapi/to-be-published-session-serializer');
const sessionWithRequiredActionSerializer = require('../../infrastructure/serializers/jsonapi/session-with-required-action-serializer');

module.exports = {
  async findFinalizedSessionsToPublish() {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return toBePublishedSessionSerializer.serialize(finalizedSessionsToPublish);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
    return sessionWithRequiredActionSerializer.serialize(finalizedSessionsWithRequiredAction);
  },
};
