const moment = require('moment');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const { UserNotAuthorizedToCreateCampaignError, UserNotAuthorizedToGetCampaignResultsError, EntityValidationError } = require('../../domain/errors');

const JSONAPI = require('../../interfaces/jsonapi');
const logger = require('../../infrastructure/logger');

module.exports = {

  save(request, reply) {
    const userId = request.auth.credentials.userId;

    return campaignSerializer.deserialize(request.payload)
      .then((campaign) => {
        campaign.creatorId = userId;
        return campaign;
      })
      .then((campaign) => usecases.createCampaign({ campaign, campaignRepository, userRepository }))
      .then((createdCampaign) => {
        return reply(campaignSerializer.serialize(createdCampaign)).code(201);
      })
      .catch((error) => {
        if(error instanceof UserNotAuthorizedToCreateCampaignError) {
          return reply(JSONAPI.forbiddenError(error.message)).code(403);
        }

        if (error instanceof EntityValidationError) {
          return reply(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }

        logger.error(error);
        return reply(JSONAPI.internalError('Une erreur inattendue est survenue lors de la création de la campagne')).code(500);
      });
  },

  getCsvResults(request, reply) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);

    const campaignId = parseInt(request.params.id);

    return usecases.getResultsCampaignInCSVFormat({ userId, campaignId,
      campaignRepository, userRepository, targetProfileRepository,
      competenceRepository, campaignParticipationRepository, organizationRepository,
      smartPlacementAssessmentRepository })
      .then((resultCampaign) => {
        const fileName = `Resultats-${resultCampaign.campaignName}-${campaignId}-${moment().format('YYYY-MM-DD-hhmm')}.csv`;
        return reply(resultCampaign.csvData)
          .header('Content-Type', 'text/csv;charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${fileName}"`);
      })
      .catch((error) => {
        if(error instanceof UserNotAuthorizedToGetCampaignResultsError) {
          return reply(JSONAPI.forbiddenError(error.message)).code(403);
        }

        logger.error(error);
        return reply(JSONAPI.internalError('Une erreur inattendue est survenue lors de la récupération des résultats de la campagne')).code(500);
      });
  }
};
