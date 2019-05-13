const usecases = require('../../domain/usecases');
const logger = require('../../infrastructure/logger');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = {

  async get(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignId = request.params.id;

    try {
      const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId });
      return serializer.serialize(campaignCollectiveResult);
    } catch (err) {
      logger.error(err);
      if (err instanceof UserNotAuthorizedToAccessEntity) {
        return h.response(err.toString()).code(403);
      }
      return h.response(err.toString()).code(400);
    }
  }
};
