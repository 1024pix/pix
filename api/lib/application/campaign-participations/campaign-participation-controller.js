const monitoringTools = require('../../infrastructure/monitoring-tools');
const usecases = require('../../domain/usecases/index.js');
const events = require('../../domain/events/index.js');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignAssessmentParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer');
const campaignAssessmentParticipationResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');
const campaignProfileSerializer = require('../../infrastructure/serializers/jsonapi/campaign-profile-serializer');
const campaignAssessmentResultMinimalSerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer');
const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer');
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

    events.eventDispatcher
      .dispatch(event)
      .catch((error) => monitoringTools.logErrorWithCorrelationIds({ message: error }));

    return h.response(campaignParticipationSerializer.serialize(campaignParticipationCreated)).created();
  },

  async shareCampaignResult(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = request.params.id;

    await DomainTransaction.execute(async (domainTransaction) => {
      const event = await usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        domainTransaction,
      });
      await events.eventBus.publish(event, domainTransaction);
      return event;
    });

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

  async deleteParticipation(request, h) {
    const { userId } = request.auth.credentials;
    const { id, campaignParticipationId } = request.params;
    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.deleteCampaignParticipation({
        userId,
        campaignId: id,
        campaignParticipationId,
        domainTransaction,
      });
    });
    return h.response({}).code(204);
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
    if (filters.groups && !Array.isArray(filters.groups)) {
      filters.groups = [filters.groups];
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

  async updateParticipantExternalId(request, h) {
    const campaignParticipationId = request.params.id;
    const participantExternalId = request.payload.data.attributes['participant-external-id'];

    await usecases.updateParticipantExternalId({ campaignParticipationId, participantExternalId });
    return h.response({}).code(204);
  },

  async deleteCampaignParticipationForAdmin(request, h) {
    const { userId } = request.auth.credentials;
    const { id: campaignParticipationId } = request.params;
    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.deleteCampaignParticipationForAdmin({
        userId,
        campaignParticipationId,
        domainTransaction,
      });
    });
    return h.response({}).code(204);
  },

  async findTrainings(request) {
    const { userId } = request.auth.credentials;
    const { id: campaignParticipationId } = request.params;
    const locale = extractLocaleFromRequest(request);

    const trainings = await usecases.findCampaignParticipationTrainings({ userId, campaignParticipationId, locale });
    return trainingSerializer.serialize(trainings);
  },
};
