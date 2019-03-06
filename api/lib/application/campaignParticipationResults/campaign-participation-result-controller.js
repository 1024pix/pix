const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-result-serializer');

module.exports = {
  async get(request) {
    const campaignParticipationId = parseInt(request.params.id);

    const report = await usecases.getCampaignParticipationResult({ campaignParticipationId });

    return serializer.serialize(report);
  },
};
