import { MissingQueryParamError } from '../http-errors.js';
import { usecases } from '../../domain/usecases/index.js';

import * as campaignToJoinSerializer from '../../infrastructure/serializers/jsonapi/campaign-to-join-serializer.js';
import * as campaignAnalysisSerializer from '../../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignReportSerializer from '../../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import * as campaignCollectiveResultSerializer from '../../infrastructure/serializers/jsonapi/campaign-collective-result-serializer.js';
import * as campaignParticipantsActivitySerializer from '../../infrastructure/serializers/jsonapi/campaign-participant-activity-serializer.js';
import * as divisionSerializer from '../../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../../infrastructure/serializers/jsonapi/group-serializer.js';

import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const getByCode = async function (request) {
  const filters = extractParameters(request.query).filter;
  await _validateFilters(filters);

  const campaignToJoin = await usecases.getCampaignByCode({ code: filters.code });
  return campaignToJoinSerializer.serialize(campaignToJoin);
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
  getByCode,
  archiveCampaign,
  unarchiveCampaign,
  getCollectiveResult,
  getAnalysis,
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
