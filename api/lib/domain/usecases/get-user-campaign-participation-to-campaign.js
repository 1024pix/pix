module.exports = async function getUserCampaignParticipationToCampaign({
  userId,
  campaignId,
  campaignParticipationRepository,
}) {
  return campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
};
