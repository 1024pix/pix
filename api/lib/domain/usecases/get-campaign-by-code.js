module.exports = function getCampaignByCode({ code, campaignRepository }) {
  return campaignRepository.getByCode(code);
};
