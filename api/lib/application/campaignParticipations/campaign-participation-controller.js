const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');

const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  save(request, h) {
    const userId = request.auth.credentials.userId;
    return serializer.deserialize(request.payload)
      .then((campaignParticipation) => usecases.startCampaignParticipation({ campaignParticipation, userId }))
      .then((campaignParticipation) => {
        return h.response(serializer.serialize(campaignParticipation)).created();
      });
  },

  find(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const options = extractParameters(request.query);

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
      })
      .catch(controllerReplies(h).error);
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
