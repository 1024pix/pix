const { BadRequestError } = require('../http-errors');
const usecases = require('../../domain/usecases');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  async getById(request) {
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    const campaignParticipation = await usecases.getCampaignParticipation({
      campaignParticipationId, options, userId
    });

    return serializer.serialize(campaignParticipation);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignParticipation = await serializer.deserialize(request.payload);
    const campaignParticipationDomain = await usecases.startCampaignParticipation({ campaignParticipation, userId });

    return h.response(serializer.serialize(campaignParticipationDomain)).created();
  },

  async find(request) {
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    if (!options.filter.assessmentId && !options.filter.campaignId) {
      throw new BadRequestError('Campaign participations must be fetched by assessmentId and/or campaignId');
    }

    if (options.filter.campaignId && options.include.includes('campaign-participation-result')) {
      const { models: campaignParticipations, pagination } = await usecases.findCampaignParticipationsWithResults({ userId, options });
      return serializer.serialize(campaignParticipations, pagination, { ignoreCampaignParticipationResultsRelationshipData: false });

    } else {
      const campaignParticipations = await usecases.findCampaignParticipationsRelatedToAssessment({ userId, assessmentId: options.filter.assessmentId });
      return serializer.serialize(campaignParticipations);
    }

  },

  shareCampaignResult(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = parseInt(request.params.id);

    return usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
    })
      .then(() => null);
  },

  async beginImprovement(request) {
    const userId = request.auth.credentials.userId;
    const campaignParticipationId = parseInt(request.params.id);

    const campaignParticipation = await usecases.beginCampaignParticipationImprovement({
      campaignParticipationId,
      userId,
    });
    return serializer.serialize(campaignParticipation);

  }
};
