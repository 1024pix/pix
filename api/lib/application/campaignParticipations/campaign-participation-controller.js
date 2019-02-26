const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');
const infraErrors = require('../../infrastructure/errors');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');

const controllerReplies = require('../../infrastructure/controller-replies');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  save(request, h) {
    const userId = request.auth.credentials.userId;
    return serializer.deserialize(request.payload)
      .then((campaignParticipation) => usecases.startCampaignParticipation({ campaignParticipation, userId }))
      .then((campaignParticipation) => {
        return h.response(serializer.serialize(campaignParticipation)).created();
      })
      .catch((error) => {
        logger.error(error);

        if (error instanceof NotFoundError) {
          const infraError = new infraErrors.NotFoundError(error.message);
          return controllerReplies(h).error(infraError);
        }

        return controllerReplies(h).error(error);
      });
  },

  find(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);

    const options = extractParameters(request.query);
    return usecases.findCampaignParticipations({
      userId,
      options,
    })
      .then((campaignParticipation) => {
        return serializer.serialize(campaignParticipation.models, campaignParticipation.pagination);
      })
      .then(controllerReplies(h).ok)
      .catch(controllerReplies(h).error);
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
          logger.error(error);
          return controllerReplies(h).error(_mapToInfrastructureErrors(error));
        });
    }
    else {
      return controllerReplies(h).error(new infraErrors.BadRequestError('campaignParticipationId manquant'));
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
