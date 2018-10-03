const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');
const infraErrors = require('../../infrastructure/errors');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');

const controllerReplies = require('../../infrastructure/controller-replies');
const { extractFilters } = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  save(request, reply) {
    const userId = request.auth.credentials.userId;
    return serializer.deserialize(request.payload)
      .then((campaignParticipation) => usecases.startCampaignParticipation({ campaignParticipation, userId }))
      .then(serializer.serialize)
      .then(controllerReplies(reply).created)
      .catch((error) => {
        logger.error(error);

        if (error instanceof NotFoundError) {
          const infraError = new infraErrors.NotFoundError(error.message);
          return controllerReplies(reply).error(infraError);
        }

        return controllerReplies(reply).error(error);
      });
  },

  getCampaignParticipationByAssessment(request, reply) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const filters = extractFilters(request);
    const assessmentId = filters.assessmentId;
    return usecases.findCampaignParticipationsByAssessmentId({
      userId,
      assessmentId,
      campaignParticipationRepository,
      smartPlacementAssessmentRepository
    })
      .then((campaignParticipation) => {
        return serializer.serialize([campaignParticipation]);
      })
      .then(controllerReplies(reply).ok);
  },

  shareCampaignResult(request, reply) {
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
        .then(() => {
          return controllerReplies(reply).noContent();
        })
        .catch((error) => {
          logger.error(error);
          return controllerReplies(reply).error(_mapToInfrastructureErrors(error));
        });
    }
    else {
      return controllerReplies(reply).error(new infraErrors.BadRequestError('campaignParticipationId manquant'));
    }
  }
};

function _mapToInfrastructureErrors(error) {
  if (error instanceof NotFoundError) {
    return new infraErrors.NotFoundError('Participation non trouvée');
  }
  if (error instanceof UserNotAuthorizedToAccessEntity) {
    return new infraErrors.UnauthorizedError('Utilisateur non authorisé à accéder à la ressource');
  }

  return error;
}
