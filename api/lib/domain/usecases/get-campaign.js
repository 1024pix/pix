const { NotFoundError } = require('../../domain/errors');

module.exports = function getCampaign({ campaignId, options, campaignRepository }) {
  const integerCampaignId = parseInt(campaignId);
  if (!Number.isFinite(integerCampaignId)) {
    throw new NotFoundError(`Campaign not found for ID ${campaignId}`);
  }

  return campaignRepository.get(integerCampaignId, options);
};
