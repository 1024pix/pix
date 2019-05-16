const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

module.exports = {

  async get(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId });
    return serializer.serialize(campaignCollectiveResult);
  }
};
