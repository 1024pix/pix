const { PassThrough } = require('stream');

const { MissingQueryParamError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  save(request, h) {
    const { userId } = request.auth.credentials;

    return campaignSerializer.deserialize(request.payload)
      .then((campaign) => {
        campaign.creatorId = userId;
        return campaign;
      })
      .then((campaign) => usecases.createCampaign({ campaign }))
      .then((createdCampaign) => {
        return h.response(campaignSerializer.serialize(createdCampaign)).created();
      });
  },

  async getByCode(request) {
    const filters = queryParamsUtils.extractParameters(request.query).filter;
    await _validateFilters(filters);

    const campaign = await usecases.retrieveCampaignInformation({ code: filters.code });
    return campaignSerializer.serialize([campaign]);
  },

  getById(request) {
    const campaignId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);
    const tokenForCampaignResults = tokenService.createTokenForCampaignResults(request.auth.credentials.userId);
    return usecases.getCampaign({ campaignId, options })
      .then((campaign) => campaignSerializer.serialize(campaign, {}, { tokenForCampaignResults }));
  },

  async getCsvAssessmentResults(request) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);
    const campaignId = parseInt(request.params.id);

    const writableStream = new PassThrough();

    const { fileName } = await usecases.startWritingCampaignAssessmentResultsToStream({ userId, campaignId, writableStream });
    const escapedFileName = requestResponseUtils.escapeFileName(fileName);

    writableStream.headers = {
      'content-type': 'text/csv;charset=utf-8',
      'content-disposition': `attachment; filename="${escapedFileName}"`,

      // WHY: to avoid compression because when compressing, the server buffers
      // for too long causing a response timeout.
      'content-encoding': 'identity',
    };

    return writableStream;
  },

  async getCsvProfilesCollectionResults(request) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);
    const campaignId = parseInt(request.params.id);

    const writableStream = new PassThrough();

    const { fileName } = await usecases.startWritingCampaignProfilesCollectionResultsToStream({ userId, campaignId, writableStream });
    const escapedFileName = requestResponseUtils.escapeFileName(fileName);

    writableStream.headers = {
      'content-type': 'text/csv;charset=utf-8',
      'content-disposition': `attachment; filename="${escapedFileName}"`,

      // WHY: to avoid compression because when compressing, the server buffers
      // for too long causing a response timeout.
      'content-encoding': 'identity',
    };

    return writableStream;
  },

  update(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);
    const { name, title, 'custom-landing-page-text': customLandingPageText } = request.payload.data.attributes;

    return usecases.updateCampaign({ userId, campaignId, name, title, customLandingPageText })
      .then(campaignSerializer.serialize);
  },

  archiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);

    return usecases.archiveCampaign({ userId, campaignId, })
      .then(campaignSerializer.serialize);
  },

  unarchiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);

    return usecases.unarchiveCampaign({ userId, campaignId })
      .then(campaignSerializer.serialize);
  },

  async getReport(request) {
    const campaignId = parseInt(request.params.id);

    const report = await usecases.getCampaignReport({ campaignId });

    return campaignReportSerializer.serialize(report);
  },

  async getCollectiveResult(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);

    const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId });
    return campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
  },

  async getAnalysis(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId });
    return campaignAnalysisSerializer.serialize(campaignAnalysis);
  }
};

function _validateFilters(filters) {
  if (typeof filters.code === 'undefined') {
    throw new MissingQueryParamError('filter.code');
  }
}

