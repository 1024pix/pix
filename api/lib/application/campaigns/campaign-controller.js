import _ from 'lodash';
import stream from 'stream';
import { MissingQueryParamError } from '../http-errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { tokenService } from '../../../lib/domain/services/token-service.js';

import * as campaignToJoinSerializer from '../../infrastructure/serializers/jsonapi/campaign-to-join-serializer.js';
import * as campaignAnalysisSerializer from '../../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignReportSerializer from '../../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import * as campaignCollectiveResultSerializer from '../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer.js';
import * as campaignProfilesCollectionParticipationSummarySerializer from '../../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js';
import * as campaignParticipantsActivitySerializer from '../../infrastructure/serializers/jsonapi/campaign-participant-activity-serializer.js';
import * as divisionSerializer from '../../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../../infrastructure/serializers/jsonapi/group-serializer.js';

import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { escapeFileName, extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import { certificabilityByLabel } from '../../../src/prescription/learner-list/application/helpers.js';
import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';

const { PassThrough } = stream;

const save = async function (request, h, dependencies = { campaignReportSerializer }) {
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
  return h.response(dependencies.campaignReportSerializer.serialize(createdCampaign)).created();
};

const getByCode = async function (request) {
  const filters = extractParameters(request.query).filter;
  await _validateFilters(filters);

  const campaignToJoin = await usecases.getCampaignByCode({ code: filters.code });
  return campaignToJoinSerializer.serialize(campaignToJoin);
};

const getById = async function (
  request,
  h,
  dependencies = {
    campaignReportSerializer,
    tokenService,
  },
) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  const tokenForCampaignResults = dependencies.tokenService.createTokenForCampaignResults({ userId, campaignId });

  const campaign = await usecases.getCampaign({ campaignId, userId });
  return dependencies.campaignReportSerializer.serialize(campaign, {}, { tokenForCampaignResults });
};

const getCsvAssessmentResults = async function (request, h, dependencies = { tokenService }) {
  const token = request.query.accessToken;
  const { userId, campaignId: extractedCampaignId } =
    dependencies.tokenService.extractCampaignResultsTokenContent(token);
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
  const escapedFileName = escapeFileName(fileName);

  writableStream.headers = {
    'content-type': 'text/csv;charset=utf-8',
    'content-disposition': `attachment; filename="${escapedFileName}"`,

    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    'content-encoding': 'identity',
  };

  return writableStream;
};

const getCsvProfilesCollectionResults = async function (request, h, dependencies = { tokenService }) {
  const token = request.query.accessToken;
  const { userId, campaignId: extractedCampaignId } =
    dependencies.tokenService.extractCampaignResultsTokenContent(token);
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
  const escapedFileName = escapeFileName(fileName);

  writableStream.headers = {
    'content-type': 'text/csv;charset=utf-8',
    'content-disposition': `attachment; filename="${escapedFileName}"`,

    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    'content-encoding': 'identity',
  };

  return writableStream;
};

const update = function (request, h, dependencies = { campaignReportSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  return usecases
    .updateCampaign({ userId, campaignId, ...request.deserializedPayload })
    .then(dependencies.campaignReportSerializer.serialize);
};

const archiveCampaign = function (request, h, dependencies = { campaignReportSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  return usecases.archiveCampaign({ userId, campaignId }).then(dependencies.campaignReportSerializer.serialize);
};

const unarchiveCampaign = function (request, h, dependencies = { campaignReportSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  return usecases.unarchiveCampaign({ userId, campaignId }).then(dependencies.campaignReportSerializer.serialize);
};

const getCollectiveResult = async function (request, h, dependencies = { campaignCollectiveResultSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId, locale });
  return dependencies.campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
};

const getAnalysis = async function (request, h, dependencies = { campaignAnalysisSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
  return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
};

const findProfilesCollectionParticipations = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const { page, filter: filters } = extractParameters(request.query);
  if (filters.divisions && !Array.isArray(filters.divisions)) {
    filters.divisions = [filters.divisions];
  }
  if (filters.groups && !Array.isArray(filters.groups)) {
    filters.groups = [filters.groups];
  }
  if (filters.certificability) {
    filters.certificability = certificabilityByLabel[filters.certificability];
  }
  const results = await usecases.findCampaignProfilesCollectionParticipationSummaries({
    userId,
    campaignId,
    page,
    filters,
  });
  return campaignProfilesCollectionParticipationSummarySerializer.serialize(results);
};

const findParticipantsActivity = async function (
  request,
  h,
  dependencies = { campaignParticipantsActivitySerializer },
) {
  const campaignId = request.params.id;

  const { page, filter: filters } = extractParameters(request.query);
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

  return dependencies.campaignParticipantsActivitySerializer.serialize(paginatedParticipations);
};

const division = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
  return divisionSerializer.serialize(divisions);
};

const getGroups = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  const groups = await usecases.getParticipantsGroup({ userId, campaignId });
  return groupSerializer.serialize(groups);
};

const campaignController = {
  save,
  getByCode,
  getById,
  getCsvAssessmentResults,
  getCsvProfilesCollectionResults,
  update,
  archiveCampaign,
  unarchiveCampaign,
  getCollectiveResult,
  getAnalysis,
  findProfilesCollectionParticipations,
  findParticipantsActivity,
  division,
  getGroups,
};

export { campaignController };

function _validateFilters(filters) {
  if (typeof filters.code === 'undefined') {
    throw new MissingQueryParamError('filter.code');
  }
}

function _getOwnerId(ownerId, defaultOwnerId) {
  return ownerId ? ownerId : defaultOwnerId;
}
