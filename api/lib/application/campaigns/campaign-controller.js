const _ = require('lodash');
const { PassThrough } = require('stream');

const { MissingQueryParamError } = require('../http-errors.js');
const usecases = require('../../domain/usecases/index.js');
const tokenService = require('../../../lib/domain/services/token-service.js');

const campaignToJoinSerializer = require('../../infrastructure/serializers/jsonapi/campaign-to-join-serializer.js');
const campaignAnalysisSerializer = require('../../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer.js');
const campaignCollectiveResultSerializer = require('../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer.js');
const campaignProfilesCollectionParticipationSummarySerializer = require('../../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js');
const campaignParticipantsActivitySerializer = require('../../infrastructure/serializers/jsonapi/campaign-participant-activity-serializer.js');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer.js');
const groupSerializer = require('../../infrastructure/serializers/jsonapi/group-serializer.js');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils.js');
const { ForbiddenAccess } = require('../../domain/errors.js');

module.exports = {
  async save(request, h) {
    const { userId: creatorId } = request.auth.credentials;
    const {
      name,
      type,
      title,
      'multiple-sendings': multipleSendings,
      'id-pix-label': idPixLabel,
      'custom-landing-page-text': customLandingPageText,
      'owner-id': ownerId,
    } = request.payload.data.attributes;
    // eslint-disable-next-line no-restricted-syntax
    const targetProfileId = parseInt(_.get(request, 'payload.data.relationships.target-profile.data.id')) || null;
    // eslint-disable-next-line no-restricted-syntax
    const organizationId = parseInt(_.get(request, 'payload.data.relationships.organization.data.id')) || null;

    const campaign = {
      name,
      type,
      title,
      idPixLabel,
      customLandingPageText,
      creatorId,
      ownerId: _getOwnerId(ownerId, creatorId),
      organizationId,
      targetProfileId,
      multipleSendings,
    };

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

    const tokenForCampaignResults = tokenService.createTokenForCampaignResults({ userId, campaignId });

    const campaign = await usecases.getCampaign({ campaignId, userId });
    return campaignReportSerializer.serialize(campaign, {}, { tokenForCampaignResults });
  },

  async getCsvAssessmentResults(request) {
    const token = request.query.accessToken;
    const { userId, campaignId: extractedCampaignId } = tokenService.extractCampaignResultsTokenContent(token);
    const campaignId = request.params.id;

    if (extractedCampaignId !== campaignId) {
      throw new ForbiddenAccess();
    }

    const writableStream = new PassThrough();

    const { fileName } = await usecases.startWritingCampaignAssessmentResultsToStream({
      userId,
      campaignId,
      writableStream,
      i18n: request.i18n,
    });
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
    const { userId, campaignId: extractedCampaignId } = tokenService.extractCampaignResultsTokenContent(token);
    const campaignId = request.params.id;

    if (extractedCampaignId !== campaignId) {
      throw new ForbiddenAccess();
    }

    const writableStream = new PassThrough();

    const { fileName } = await usecases.startWritingCampaignProfilesCollectionResultsToStream({
      userId,
      campaignId,
      writableStream,
      i18n: request.i18n,
    });
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
    const campaignId = request.params.id;

    return usecases
      .updateCampaign({ userId, campaignId, ...request.deserializedPayload })
      .then(campaignReportSerializer.serialize);
  },

  archiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    return usecases.archiveCampaign({ userId, campaignId }).then(campaignReportSerializer.serialize);
  },

  unarchiveCampaign(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    return usecases.unarchiveCampaign({ userId, campaignId }).then(campaignReportSerializer.serialize);
  },

  async getCollectiveResult(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;
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

  async findProfilesCollectionParticipations(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    if (filters.divisions && !Array.isArray(filters.divisions)) {
      filters.divisions = [filters.divisions];
    }
    if (filters.groups && !Array.isArray(filters.groups)) {
      filters.groups = [filters.groups];
    }
    const results = await usecases.findCampaignProfilesCollectionParticipationSummaries({
      userId,
      campaignId,
      page,
      filters,
    });
    return campaignProfilesCollectionParticipationSummarySerializer.serialize(results);
  },

  async findParticipantsActivity(request) {
    const campaignId = request.params.id;

    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    if (filters.divisions && !Array.isArray(filters.divisions)) {
      filters.divisions = [filters.divisions];
    }
    if (filters.groups && !Array.isArray(filters.groups)) {
      filters.groups = [filters.groups];
    }

    const { userId } = request.auth.credentials;
    const paginatedParticipations = await usecases.findPaginatedCampaignParticipantsActivities({
      userId,
      campaignId,
      page,
      filters,
    });

    return campaignParticipantsActivitySerializer.serialize(paginatedParticipations);
  },

  async division(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
    return divisionSerializer.serialize(divisions);
  },

  async getGroups(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const groups = await usecases.getParticipantsGroup({ userId, campaignId });
    return groupSerializer.serialize(groups);
  },
};

function _validateFilters(filters) {
  if (typeof filters.code === 'undefined') {
    throw new MissingQueryParamError('filter.code');
  }
}

function _getOwnerId(ownerId, defaultOwnerId) {
  return ownerId ? ownerId : defaultOwnerId;
}
