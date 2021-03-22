const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-result-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async get(request) {
    const locale = extractLocaleFromRequest(request);
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;

    const participationResult = await usecases.getCampaignParticipationResult({ campaignParticipationId, userId, locale });

    return serializer.serialize(participationResult);
  },
};
