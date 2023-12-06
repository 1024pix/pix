import { usecases } from '../domain/usecases/index.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

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

const campaignDetailController = {
  getById,
};

export { campaignDetailController };
