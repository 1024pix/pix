const controllerReplies = require('../../infrastructure/controller-replies');
const infraErrors = require('../../infrastructure/errors');

const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');
const { extractFilters } = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  getCampaignParticipationByAssessment(request, reply) {
    const filters = extractFilters(request);
    const assessmentId = filters.assessmentId;
    return usecases.findCampaignParticipationsByAssessmentId({
      assessmentId,
      campaignParticipationRepository,
    })
      .then((campaignParticipation) => {
        return serializer.serialize(campaignParticipation);
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
          return controllerReplies(reply).error(mapToInfrastructureErrors(error));
        });
    }
    else {
      return controllerReplies(reply).error(new infraErrors.BadRequestError('campaignParticipationId manquant'));
    }
  }
}
;

function mapToInfrastructureErrors(error) {

  if (error instanceof NotFoundError) {
    return new infraErrors.NotFoundError('Participation non trouvée');
  }
  if (error instanceof UserNotAuthorizedToAccessEntity) {
    return new infraErrors.UnauthorizedError('Utilisateur non authorisé à accéder à la ressource');
  }

  return error;
}
