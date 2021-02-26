const usecases = require('../../domain/usecases');
const publishableSessionSerializer = require('../../infrastructure/serializers/jsonapi/publishable-session-serializer');
const sessionWithRequiredActionSerializer = require('../../infrastructure/serializers/jsonapi/session-with-required-action-serializer');

module.exports = {
  async findFinalizedSessionsToPublish() {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return publishableSessionSerializer.serialize(finalizedSessionsToPublish);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const finalizedSessionsWithRequiredAction = await usecases.findFinalizedSessionsWithRequiredAction();
    return sessionWithRequiredActionSerializer.serialize(finalizedSessionsWithRequiredAction);
  },
};
