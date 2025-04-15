import stream from 'node:stream';

import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { escapeFileName } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as campaignDetailsManagementSerializer from '../infrastructure/serializers/jsonapi/campaign-management-serializer.js';
import * as campaignParticipantsActivitySerializer from '../infrastructure/serializers/jsonapi/campaign-participant-activity-serializer.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import * as campaignToJoinSerializer from '../infrastructure/serializers/jsonapi/campaign-to-join-serializer.js';
import * as targetProfileSerializer from '../infrastructure/serializers/jsonapi/target-profile-serializer.js';

const { PassThrough } = stream;

const getByCode = async function (
  request,
  _,
  dependencies = {
    extractLocaleFromRequest,
    campaignToJoinSerializer,
  },
) {
  const { code } = request.query.filter;
  const locale = dependencies.extractLocaleFromRequest(request);

  const campaignToJoin = await usecases.getCampaignByCode({ code, locale });
  return dependencies.campaignToJoinSerializer.serialize(campaignToJoin);
};

const getById = async function (
  request,
  _,
  dependencies = {
    campaignReportSerializer,
  },
) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const campaign = await usecases.getCampaign({ campaignId, userId });
  return dependencies.campaignReportSerializer.serialize(campaign);
};

const getCampaignDetails = async function (request) {
  const { campaignId } = request.params;
  const campaign = await usecases.getCampaignManagement({ campaignId });
  return campaignDetailsManagementSerializer.serialize(campaign);
};

const getTargetProfile = async function (request, _, dependencies = { targetProfileSerializer }) {
  const { campaignId } = request.params;
  const targetProfile = await usecases.getTargetProfile({ campaignId });
  return dependencies.targetProfileSerializer.serialize(targetProfile);
};

const findPaginatedFilteredCampaigns = async function (request, _, dependencies = { campaignReportSerializer }) {
  const { organizationId } = request.params;
  const options = request.query;
  const userId = request.auth.credentials.userId;

  if (options.filter.status === 'archived') {
    options.filter.ongoing = false;
    delete options.filter.status;
  }
  const { models: campaigns, meta } = await usecases.findPaginatedFilteredOrganizationCampaigns({
    organizationId,
    filter: options.filter,
    page: options.page,
    userId,
  });
  return dependencies.campaignReportSerializer.serialize(campaigns, meta);
};

const getCsvAssessmentResults = async function (request, h) {
  const { campaignId } = request.params;

  const writableStream = new PassThrough();

  const { fileName } = await usecases.startWritingCampaignAssessmentResultsToStream({
    campaignId,
    writableStream,
    i18n: request.i18n,
  });
  const escapedFileName = escapeFileName(fileName);

  return (
    h
      .response(writableStream)
      .header('content-type', 'text/csv;charset=utf-8')
      // WHY: to avoid compression because when compressing, the server buffers
      // for too long causing a response timeout.
      .header('content-encoding', 'identity')
      .header('content-disposition', `attachment; filename="${escapedFileName}"`)
  );
};

const getCsvProfilesCollectionResults = async function (request, h) {
  const { campaignId } = request.params;

  const writableStream = new PassThrough();

  const { fileName } = await usecases.startWritingCampaignProfilesCollectionResultsToStream({
    campaignId,
    writableStream,
    i18n: request.i18n,
  });
  const escapedFileName = escapeFileName(fileName);

  return (
    h
      .response(writableStream)
      .header('content-type', 'text/csv;charset=utf-8')
      // WHY: to avoid compression because when compressing, the server buffers
      // for too long causing a response timeout.
      .header('content-encoding', 'identity')
      .header('content-disposition', `attachment; filename="${escapedFileName}"`)
  );
};
const findParticipantsActivity = async function (
  request,
  h,
  dependencies = { campaignParticipantsActivitySerializer },
) {
  const { campaignId } = request.params;

  const { page, filter: filters } = request.query;
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

const campaignDetailController = {
  getByCode,
  getById,
  findParticipantsActivity,
  findPaginatedFilteredCampaigns,
  getCsvAssessmentResults,
  getCsvProfilesCollectionResults,
  getCampaignDetails,
  getTargetProfile,
};

export { campaignDetailController };
