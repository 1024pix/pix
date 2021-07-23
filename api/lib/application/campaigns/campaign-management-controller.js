const usecases = require('../../domain/usecases');

const campaignDetailsManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-details-management-serializer');

module.exports = {
  async getCampaignDetails(request) {
    const campaignId = request.params.id;
    const campaign = await usecases.getCampaignDetailsManagement({ campaignId });
    return campaignDetailsManagementSerializer.serialize(campaign);
  },

  async updateCampaignDetailsManagement() {
  },
};
