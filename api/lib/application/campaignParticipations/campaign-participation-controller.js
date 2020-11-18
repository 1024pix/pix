const usecases = require('../../domain/usecases');
const events = require('../../domain/events');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignAssessmentParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer');
const campaignAssessmentParticipationResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');
const campaignProfileSerializer = require('../../infrastructure/serializers/jsonapi/campaign-profile-serializer');

module.exports = {

  async getById(request) {
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    const campaignParticipation = await usecases.getCampaignParticipation({
      campaignParticipationId, options, userId,
    });

    return serializer.serialize(campaignParticipation);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignParticipation = await serializer.deserialize(request.payload);
  
    const event = await usecases.startCampaignParticipation({ campaignParticipation, userId });
    await events.eventDispatcher.dispatch(event);

    return h.response(serializer.serialize(event.campaignParticipation)).created();
  },

  async find(request) {
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);
    const campaignParticipations = await usecases.findCampaignParticipationsRelatedToAssessment({ userId, assessmentId: options.filter.assessmentId });
    return serializer.serialize(campaignParticipations);
  },

  async shareCampaignResult(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = parseInt(request.params.id);

    const event = await usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
    });
    await events.eventDispatcher.dispatch(event);
    return null;
  },

  async beginImprovement(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = parseInt(request.params.id);

    const campaignParticipation = await usecases.beginCampaignParticipationImprovement({
      campaignParticipationId,
      userId,
    });
    return serializer.serialize(campaignParticipation);

  },

  async getAnalysis(request) {
    const { userId } = request.auth.credentials;
    const campaignParticipationId = request.params.id;

    const campaignAnalysis = await usecases.computeCampaignParticipationAnalysis({ userId, campaignParticipationId });
    return campaignAnalysisSerializer.serialize(campaignAnalysis);
  },

  async getCampaignProfile(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;

    const campaignProfile = await usecases.getCampaignProfile({ userId, campaignId, campaignParticipationId });
    return campaignProfileSerializer.serialize(campaignProfile);
  },

  async getCampaignAssessmentParticipation(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;

    const campaignAssessmentParticipation = await usecases.getCampaignAssessmentParticipation({ userId, campaignId, campaignParticipationId });
    return campaignAssessmentParticipationSerializer.serialize(campaignAssessmentParticipation);
  },

  async getCampaignAssessmentParticipationResult(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;

    const campaignAssessmentParticipationResult = await usecases.getCampaignAssessmentParticipationResult({ userId, campaignId, campaignParticipationId });
    return campaignAssessmentParticipationResultSerializer.serialize(campaignAssessmentParticipationResult);
  },
};
