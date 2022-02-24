const usecases = require('../../domain/usecases');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const campaignDetailsManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-details-management-serializer');
const participationForCampaignManagementSerializer = require('../../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer');

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
    const {
      name,
      title,
      'custom-landing-page-text': customLandingPageText,
      'custom-result-page-button-text': customResultPageButtonText,
      'custom-result-page-button-url': customResultPageButtonUrl,
      'custom-result-page-text': customResultPageText,
    } = request.payload.data.attributes;
    await usecases.updateCampaignDetailsManagement({
      campaignId,
      name,
      title,
      customLandingPageText,
      customResultPageText,
      customResultPageButtonText,
      customResultPageButtonUrl,
    });
    return h.response({}).code(204);
  },
};
