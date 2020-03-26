const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-result-serializer');

module.exports = {
  async get(request) {
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;

    const report = await usecases.getCampaignParticipationResult({ campaignParticipationId, userId });

    return serializer.serialize(report);
  },
};
