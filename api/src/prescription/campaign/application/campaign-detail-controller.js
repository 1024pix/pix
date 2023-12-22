import stream from 'stream';

import { usecases } from '../domain/usecases/index.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';
import { escapeFileName } from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { ForbiddenAccess } from '../../../shared/domain/errors.js';

const { PassThrough } = stream;

const getById = async function (
  request,
  _,
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

const findPaginatedFilteredCampaigns = async function (
  request,
  _,
  dependencies = {
    queryParamsUtils,
    campaignReportSerializer,
  },
) {
  const organizationId = request.params.id;
  const options = dependencies.queryParamsUtils.extractParameters(request.query);
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

const campaignDetailController = {
  getById,
  findPaginatedFilteredCampaigns,
  getCsvProfilesCollectionResults,
};

export { campaignDetailController };
