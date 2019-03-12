const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  async getById(request) {
    const campaignParticipationId = request.params.id;
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    const campaignParticipation = await usecases.getCampaignParticipation({
      campaignParticipationId,
      options,
      userId
    });

    return serializer.serialize(campaignParticipation);
  },

  save(request, h) {
    const userId = request.auth.credentials.userId;
    return serializer.deserialize(request.payload)
      .then((campaignParticipation) => usecases.startCampaignParticipation({ campaignParticipation, userId }))
      .then((campaignParticipation) => {
        return h.response(serializer.serialize(campaignParticipation)).created();
      });
  },

  find(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const options = queryParamsUtils.extractParameters(request.query);

    let campaignParticipationsPromise;

    if (options.filter.assessmentId) {
      campaignParticipationsPromise = usecases.getUserCampaignParticipation({ userId, options });
    }
    if (options.filter.campaignId) {
      campaignParticipationsPromise = usecases.getCampaignParticipations({ userId, options });
    }
    return campaignParticipationsPromise
      .then((campaignParticipation) => {
        return serializer.serialize(campaignParticipation.models, campaignParticipation.pagination);
      });
  },

  shareCampaignResult(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const campaignParticipationId = parseInt(request.params.id);

    return usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
      campaignParticipationRepository,
      smartPlacementAssessmentRepository
    })
      .then(() => null);
  }
};
