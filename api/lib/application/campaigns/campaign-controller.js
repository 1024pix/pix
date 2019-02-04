const moment = require('moment');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const {
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToUpdateRessourceError,
  UserNotAuthorizedToGetCampaignResultsError,
  EntityValidationError,
  NotFoundError
} = require('../../domain/errors');

const JSONAPI = require('../../interfaces/jsonapi');
const logger = require('../../infrastructure/logger');
const controllerReplies = require('../../infrastructure/controller-replies');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const infraErrors = require('../../infrastructure/errors');

module.exports = {

  save(request, h) {

    const userId = request.auth.credentials.userId;

    return campaignSerializer.deserialize(request.payload)
      .then((campaign) => {
        campaign.creatorId = userId;
        return campaign;
      })
      .then((campaign) => usecases.createCampaign({ campaign }))
      .then((createdCampaign) => {
        return h.response(campaignSerializer.serialize(createdCampaign)).code(201);
      })
      .catch((error) => {
        if (error instanceof UserNotAuthorizedToCreateCampaignError) {
          return h.response(JSONAPI.forbiddenError(error.message)).code(403);
        }

        if (error instanceof EntityValidationError) {
          return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }

        logger.error(error);
        return h.response(JSONAPI.internalError('Une erreur inattendue est survenue lors de la création de la campagne')).code(500);
      });
  },

  getByCode(request, h) {
    const filters = queryParamsUtils.extractParameters(request.query).filter;
    return _validateFilters(filters)
      .then(() => usecases.getCampaignByCode({ code: filters.code }))
      .then((campaign) => {
        return campaignSerializer.serialize([campaign]);
      })
      .then(controllerReplies(h).ok)
      .catch((error) => {
        const mappedError = _mapToInfraError(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getById(request, h) {
    const campaignId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);
    const tokenForCampaignResults = tokenService.createTokenForCampaignResults(request.auth.credentials.userId);
    return usecases.getCampaign({ campaignId, options })
      .then((campaign) => campaignSerializer.serialize(campaign, tokenForCampaignResults))
      .then(controllerReplies(h).ok)
      .catch((error) => {
        const mappedError = _mapToInfraError(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getCsvResults(request, h) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);

    const campaignId = parseInt(request.params.id);

    return usecases.getResultsCampaignInCSVFormat({ userId, campaignId })
      .then((resultCampaign) => {
        const fileName = `Resultats-${resultCampaign.campaignName}-${campaignId}-${moment().format('YYYY-MM-DD-hhmm')}.csv`;
        return h.response(resultCampaign.csvData)
          .header('Content-Type', 'text/csv;charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${fileName}"`);
      })
      .catch((error) => {
        if (error instanceof UserNotAuthorizedToGetCampaignResultsError) {
          return h.response(JSONAPI.forbiddenError(error.message)).code(403);
        }

        logger.error(error);
        return h.response(JSONAPI.internalError('Une erreur inattendue est survenue lors de la récupération des résultats de la campagne')).code(500);
      });
  },

  update(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignId = request.params.id;
    const { title, 'custom-landing-page-text': customLandingPageText } = request.payload.data.attributes;

    return usecases.updateCampaign({ userId, campaignId, title, customLandingPageText })
      .then(campaignSerializer.serialize)
      .then(controllerReplies(h).ok)
      .catch((error) => {
        if (error instanceof UserNotAuthorizedToUpdateRessourceError) {
          const infraError = new infraErrors.ForbiddenError(error.message);
          return controllerReplies(h).error(infraError);
        }

        const mappedError = _mapToInfraError(error);
        return controllerReplies(h).error(mappedError);
      });
  },
};

function _validateFilters(filters) {
  return new Promise((resolve) => {
    if (typeof filters.code === 'undefined') {
      throw new infraErrors.MissingQueryParamError('filter.code');
    }
    resolve();
  });
}

function _mapToInfraError(error) {
  if (error instanceof NotFoundError) {
    return new infraErrors.NotFoundError(error.message);
  }

  return error;
}
