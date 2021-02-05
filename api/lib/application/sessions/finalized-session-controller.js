const usecases = require('../../domain/usecases');
const finalizedSessionSerializer = require('../../infrastructure/serializers/jsonapi/finalized-session-serializer');

module.exports = {
  async findFinalizedSessionsToPublish() {
    const finalizedSessionsToPublish = await usecases.findFinalizedSessionsToPublish();
    return finalizedSessionSerializer.serialize(finalizedSessionsToPublish);
  },
};
