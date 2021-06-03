const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/participant-result-serializer');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async get(request) {
    const locale = extractLocaleFromRequest(request);
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;

    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId); // used only until deprecated route will be removed
    const participationResult = await usecases.getUserCampaignAssessmentResult({ userId, campaignId: campaignParticipation.campaignId, locale });

    return serializer.serialize(participationResult);
  },
};
