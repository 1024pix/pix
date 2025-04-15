const getTargetProfile = async function ({ campaignId, targetProfileRepository }) {
  return targetProfileRepository.getByCampaignId({ campaignId });
};

export { getTargetProfile };
