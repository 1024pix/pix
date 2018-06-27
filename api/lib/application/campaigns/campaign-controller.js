const usecases = require('../../domain/usecases');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const Campaign = require('../../domain/models/Campaign');
const { UserNotAuthorizedToCreateCampaignError, EntityValidationError } = require('../../domain/errors');

const JSONAPI = require('../../interfaces/jsonapi');
const logger = require('../../infrastructure/logger');

module.exports = {

  save(request, reply) {
    const userId = request.auth.credentials.userId;
    const deserializedCampaign = campaignSerializer.deserialize(request.payload);
    const campaign = new Campaign(deserializedCampaign);
    campaign.creatorId = userId;

    return usecases.createCampaign({ campaign, campaignRepository, userRepository })
      .then((createdCampaign) => {
        return reply(campaignSerializer.serialize(createdCampaign)).code(201);
      })
      .catch((error) => {
        if(error instanceof UserNotAuthorizedToCreateCampaignError) {
          reply(JSONAPI.forbiddenError(error.message)).code(403);
        }

        if (error instanceof EntityValidationError) {
          reply(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }

        logger.error(error);
        return reply(JSONAPI.internalError('Une erreur inattendue est survenue lors de la création de la campagne')).code(500);
      });
  }
};
