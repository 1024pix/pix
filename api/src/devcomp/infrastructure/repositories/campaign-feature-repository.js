const getHighlightedTrainingsForCampaign = async function ({ campaignId, campaignFeatureApi }) {
  return campaignFeatureApi.getHighlightedTrainingsForCampaign({ campaignId });
};

export { getHighlightedTrainingsForCampaign };
