import { usecases } from '../domain/usecases/index.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';

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

const campaignDetailController = {
  getById,
  findPaginatedFilteredCampaigns,
};

export { campaignDetailController };
