const _ = require('lodash');
const { PassThrough } = require('stream');

const { MissingQueryParamError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const campaignToJoinSerializer = require('../../infrastructure/serializers/jsonapi/campaign-to-join-serializer');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer');
const campaignProfilesCollectionParticipationSummarySerializer = require('../../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer');
const campaignAssessmentParticipationSummarySerializer = require('../../infrastructure/serializers/jsonapi/campaign-assessment-participation-summary-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async save(request, h) {
    const { userId } = request.auth.credentials;
    const {
      name,
      type,
      title,
      'id-pix-label': idPixLabel,
      'custom-landing-page-text': customLandingPageText,
    } = request.payload.data.attributes;
    const targetProfileId = parseInt(_.get(request, 'payload.data.relationships.target-profile.data.id')) || null;
    const organizationId = parseInt(_.get(request, 'payload.data.relationships.organization.data.id')) || null;

    const campaign = { name, type, title, idPixLabel, customLandingPageText, creatorId: userId, organizationId, targetProfileId };
    const createdCampaign = await usecases.createCampaign({ campaign });
    return h.response(campaignReportSerializer.serialize(createdCampaign)).created();
  },

  async getByCode(request) {
    const filters = queryParamsUtils.extractParameters(request.query).filter;
    await _validateFilters(filters);

    const campaignToJoin = await usecases.getCampaignByCode({ code: filters.code });
    return campaignToJoinSerializer.serialize(campaignToJoin);
  },

  async getById(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const tokenForCampaignResults = tokenService.createTokenForCampaignResults(userId);

    const campaign = await usecases.getCampaign({ campaignId, userId });
    return campaignReportSerializer.serialize(campaign, {}, { tokenForCampaignResults });
  },

  async getCsvAssessmentResults(request) {
    const token = request.query.accessToken;
    const userId = tokenService.extractUserIdForCampaignResults(token);
    const campaignId = parseInt(request.params.id);

    const writableStream = new PassThrough();

    const { fileName } = await usecases.startWritingCampaignAssessmentResultsToStream({ userId, campaignId, writableStream, i18n: request.i18n });
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

    const { fileName } = await usecases.startWritingCampaignProfilesCollectionResultsToStream({ userId, campaignId, writableStream, i18n: request.i18n });
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
      .then(campaignReportSerializer.serialize);
  },

  archiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);

    return usecases.archiveCampaign({ userId, campaignId })
      .then(campaignReportSerializer.serialize);
  },

  unarchiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);

    return usecases.unarchiveCampaign({ userId, campaignId })
      .then(campaignReportSerializer.serialize);
  },

  async getCollectiveResult(request) {
    const { userId } = request.auth.credentials;
    const campaignId = parseInt(request.params.id);
    const locale = extractLocaleFromRequest(request);

    const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId, locale });
    return campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
  },

  async getAnalysis(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;
    const locale = extractLocaleFromRequest(request);

    const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
    return campaignAnalysisSerializer.serialize(campaignAnalysis);
  },

  async findAssessmentParticipations(request) {
    const campaignId = request.params.id;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    if (filters.divisions && !Array.isArray(filters.divisions)) {
      filters.divisions = [filters.divisions];
    }
    if (filters.badges && !Array.isArray(filters.badges)) {
      filters.badges = [filters.badges];
    }
    if (filters.stages && !Array.isArray(filters.stages)) {
      filters.stages = [filters.stages];
    }
    const currentUserId = requestResponseUtils.extractUserIdFromRequest(request);
    const campaignAssessmentParticipationSummariesPaginated = await usecases.findPaginatedCampaignAssessmentParticipationSummaries({ userId: currentUserId, campaignId, page, filters });
    return campaignAssessmentParticipationSummarySerializer.serializeForPaginatedList(campaignAssessmentParticipationSummariesPaginated);
  },

  async findProfilesCollectionParticipations(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    if (filters.divisions && !Array.isArray(filters.divisions)) {
      filters.divisions = [filters.divisions];
    }
    const results = await usecases.findCampaignProfilesCollectionParticipationSummaries({ userId, campaignId, page, filters });
    return campaignProfilesCollectionParticipationSummarySerializer.serialize(results);
  },

  async division(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
    return divisionSerializer.serialize(divisions);
  },
};

function _validateFilters(filters) {
  if (typeof filters.code === 'undefined') {
    throw new MissingQueryParamError('filter.code');
  }
}
