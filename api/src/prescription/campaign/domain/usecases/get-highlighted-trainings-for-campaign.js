const getHighlightedTrainingsForCampaign = async function ({ campaignId, campaignFeatureRepository }) {
  return await campaignFeatureRepository.getHighlightedTrainingsForCampaign({ campaignId });
};

export { getHighlightedTrainingsForCampaign };
