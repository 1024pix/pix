const getUserCampaignParticipationToCampaign = async function ({
  userId,
  campaignId,
  campaignParticipationRepository,
}) {
  return campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
};

export { getUserCampaignParticipationToCampaign };
