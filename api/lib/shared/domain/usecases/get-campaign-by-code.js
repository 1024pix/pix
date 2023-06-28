const getCampaignByCode = function ({ code, campaignToJoinRepository }) {
  return campaignToJoinRepository.getByCode(code);
};

export { getCampaignByCode };
