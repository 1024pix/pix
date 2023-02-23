const usecases = require('../../domain/usecases/index.js');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');
const campaignDetailsManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-details-management-serializer.js');
const participationForCampaignManagementSerializer = require('../../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer.js');
const commonDeserializer = require('../../infrastructure/serializers/jsonapi/deserializer.js');

module.exports = {
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
