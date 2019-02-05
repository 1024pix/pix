module.exports = function getCampaign({ campaignId, options, campaignRepository }) {
  return campaignRepository.get(campaignId, options);
};
