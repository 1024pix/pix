const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');
const infraErrors = require('../../infrastructure/errors');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');

const controllerReplies = require('../../infrastructure/controller-replies');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const domainToInfraErrorsConverter = require('../../infrastructure/utils/domain-to-infra-errors-converter');

module.exports = {

  save(request, h) {
    const userId = request.auth.credentials.userId;
    return serializer.deserialize(request.payload)
      .then((campaignParticipation) => usecases.startCampaignParticipation({ campaignParticipation, userId }))
      .then((campaignParticipation) => {
        return h.response(serializer.serialize(campaignParticipation)).created();
      })
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getCampaignParticipationByAssessment(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const filters = extractParameters(request.query).filter;
    const assessmentId = filters.assessmentId;
    return usecases.findCampaignParticipationsByAssessmentId({
      userId,
      assessmentId,
      campaignParticipationRepository,
      smartPlacementAssessmentRepository
    })
      .then((campaignParticipation) => {
        return serializer.serialize([campaignParticipation]);
      });
  },

  shareCampaignResult(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const campaignParticipationId = parseInt(request.params.id);

    if (campaignParticipationId) {
      return usecases.shareCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        smartPlacementAssessmentRepository
      })
        .then(() => null)
        .catch((error) => {
          const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
          return controllerReplies(h).error(mappedError);
        });
    }
    else {
      return controllerReplies(h).error(new infraErrors.BadRequestError('campaignParticipationId manquant'));
    }
  }
};
