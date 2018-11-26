module.exports = function getCampaign({ campaignId, campaignRepository }) {
  return campaignRepository.get(campaignId);
};
