const monitoringTools = require('../../infrastructure/monitoring-tools');
const usecases = require('../../domain/usecases');
const events = require('../../domain/events');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignAssessmentParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer');
const campaignAssessmentParticipationResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');
const campaignProfileSerializer = require('../../infrastructure/serializers/jsonapi/campaign-profile-serializer');
const campaignAssessmentResultMinimalSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignParticipation = await campaignParticipationSerializer.deserialize(request.payload);

    const { event, campaignParticipation: campaignParticipationCreated } = await DomainTransaction.execute(
      (domainTransaction) => {
        return usecases.startCampaignParticipation({ campaignParticipation, userId, domainTransaction });
      }
    );
    events.eventDispatcher.dispatch(event).catch((error) => monitoringTools.logErrorWithCorrelationIds(error));

    return h.response(campaignParticipationSerializer.serialize(campaignParticipationCreated)).created();
  },

  async shareCampaignResult(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = request.params.id;

    const event = await DomainTransaction.execute((domainTransaction) => {
      return usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        domainTransaction,
      });
    });

    events.eventDispatcher.dispatch(event).catch((error) => monitoringTools.logErrorWithCorrelationIds(error));
    return null;
  },

  async beginImprovement(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = request.params.id;

    return DomainTransaction.execute(async (domainTransaction) => {
      await usecases.beginCampaignParticipationImprovement({
        campaignParticipationId,
        userId,
        domainTransaction,
      });
      return null;
    });
  },

  async getAnalysis(request) {
    const { userId } = request.auth.credentials;
    const campaignParticipationId = request.params.id;
    const locale = extractLocaleFromRequest(request);

    const campaignAnalysis = await usecases.computeCampaignParticipationAnalysis({
      userId,
      campaignParticipationId,
      locale,
    });
    return campaignAnalysisSerializer.serialize(campaignAnalysis);
  },

  async getCampaignProfile(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;
    const locale = extractLocaleFromRequest(request);

    const campaignProfile = await usecases.getCampaignProfile({ userId, campaignId, campaignParticipationId, locale });
    return campaignProfileSerializer.serialize(campaignProfile);
  },

  async getCampaignAssessmentParticipation(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;

    const campaignAssessmentParticipation = await usecases.getCampaignAssessmentParticipation({
      userId,
      campaignId,
      campaignParticipationId,
    });
    return campaignAssessmentParticipationSerializer.serialize(campaignAssessmentParticipation);
  },

  async getCampaignAssessmentParticipationResult(request) {
    const { userId } = request.auth.credentials;
    const { campaignId, campaignParticipationId } = request.params;
    const locale = extractLocaleFromRequest(request);

    const campaignAssessmentParticipationResult = await usecases.getCampaignAssessmentParticipationResult({
      userId,
      campaignId,
      campaignParticipationId,
      locale,
    });
    return campaignAssessmentParticipationResultSerializer.serialize(campaignAssessmentParticipationResult);
  },

  async findAssessmentParticipationResults(request) {
    const campaignId = request.params.id;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    if (filters.divisions && !Array.isArray(filters.divisions)) {
      filters.divisions = [filters.divisions];
    }
    if (filters.badges && !Array.isArray(filters.badges)) {
      filters.badges = [filters.badges];
    }
    if (filters.stages && !Array.isArray(filters.stages)) {
      filters.stages = [filters.stages];
    }
    const currentUserId = requestResponseUtils.extractUserIdFromRequest(request);
    const paginatedParticipations = await usecases.findAssessmentParticipationResultList({
      userId: currentUserId,
      campaignId,
      page,
      filters,
    });
    return campaignAssessmentResultMinimalSerializer.serialize(paginatedParticipations);
  },
};
