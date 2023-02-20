import usecases from '../../domain/usecases';
import queryParamsUtils from '../../infrastructure/utils/query-params-utils';
import campaignDetailsManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-details-management-serializer';
import participationForCampaignManagementSerializer from '../../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer';
import commonDeserializer from '../../infrastructure/serializers/jsonapi/deserializer';

export default {
  async getCampaignDetails(request) {
    const campaignId = request.params.id;
    const campaign = await usecases.getCampaignDetailsManagement({ campaignId });
    return campaignDetailsManagementSerializer.serialize(campaign);
  },

  async findPaginatedParticipationsForCampaignManagement(request) {
    const campaignId = request.params.id;
    const { page } = queryParamsUtils.extractParameters(request.query);

    const { models: participationsForCampaignManagement, meta } =
      await usecases.findPaginatedParticipationsForCampaignManagement({
        campaignId,
        page,
      });
    return participationForCampaignManagementSerializer.serialize(participationsForCampaignManagement, meta);
  },

  async updateCampaignDetailsManagement(request, h) {
    const campaignId = request.params.id;

    const campaignDetailsManagement = await commonDeserializer.deserialize(request.payload);
    await usecases.updateCampaignDetailsManagement({
      campaignId,
      ...campaignDetailsManagement,
    });
    return h.response({}).code(204);
  },
};
