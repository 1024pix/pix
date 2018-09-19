const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

const JSONAPI = require('../../interfaces/jsonapi');
const logger = require('../../infrastructure/logger');
const { extractFilters } = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  /*TODO use controller replies */

  getCampaignParticipationByAssessment(request, reply) {
    const filters = extractFilters(request);
    const assessmentId = filters.assessmentId;
    return usecases.findCampaignParticipationsByAssessmentId({
      assessmentId,
      campaignParticipationRepository,
    })
      .then((campaignParticipation) => {
        const serializedCampaignParticipation = serializer.serialize(campaignParticipation);
        return reply(serializedCampaignParticipation).code(200);
      });
  },

  shareCampaignResult(request, reply) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const campaignParticipationId = parseInt(request.params.id);

    if (campaignParticipationId) {
      return usecases.allowUserToShareHisCampaignResult({
        userId,
        campaignParticipationId,
        campaignParticipationRepository,
        smartPlacementAssessmentRepository
      })
        .then((campaignParticipation) => {
          return reply(campaignParticipation).code(204);
        })
        .catch((error) => {
          if (error instanceof NotFoundError) {
            const errorMessage = 'Participation non trouvée';
            return reply(JSONAPI.notFoundError(errorMessage)).code(404);
          }
          if (error instanceof UserNotAuthorizedToAccessEntity) {
            const errorMessage = 'Utilisateur non authorisé à accéder à la ressource';
            return reply(JSONAPI.unauthorized(errorMessage)).code(401);
          }
          logger.error(error);
        });
    }
    else {
      return reply(JSONAPI.badRequest('campaignParticipationId manquant')).code(400);
    }
  }
};
