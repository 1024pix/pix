const usecases = require('../../domain/usecases');

const campaignDetailsManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-details-management-serializer');

module.exports = {
  async getCampaignDetails(request) {
    const campaignId = request.params.id;
    const campaign = await usecases.getCampaignDetailsManagement({ campaignId });
    return campaignDetailsManagementSerializer.serialize(campaign);
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
