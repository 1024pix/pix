import { usecases } from '../../domain/usecases/index.js';
import { queryParamsUtils } from '../../infrastructure/utils/query-params-utils.js';
import * as campaignDetailsManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-details-management-serializer.js';
import * as participationForCampaignManagementSerializer from '../../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer.js';
import { commonDeserializer } from '../../infrastructure/serializers/jsonapi/deserializer.js';

const getCampaignDetails = async function (request) {
  const campaignId = request.params.id;
  const campaign = await usecases.getCampaignDetailsManagement({ campaignId });
  return campaignDetailsManagementSerializer.serialize(campaign);
};

const findPaginatedParticipationsForCampaignManagement = async function (request) {
  const campaignId = request.params.id;
  const { page } = queryParamsUtils.extractParameters(request.query);

  const { models: participationsForCampaignManagement, meta } =
    await usecases.findPaginatedParticipationsForCampaignManagement({
      campaignId,
      page,
    });
  return participationForCampaignManagementSerializer.serialize(participationsForCampaignManagement, meta);
};

const updateCampaignDetailsManagement = async function (request, h) {
  const campaignId = request.params.id;

  const campaignDetailsManagement = await commonDeserializer.deserialize(request.payload);
  await usecases.updateCampaignDetailsManagement({
    campaignId,
    ...campaignDetailsManagement,
  });
  return h.response({}).code(204);
};

export { getCampaignDetails, findPaginatedParticipationsForCampaignManagement, updateCampaignDetailsManagement };
