module.exports = function getUserCampaignParticipationToCampaign({
  userId,
  campaignId,
  campaignParticipationRepository,
}) {
  return campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
};
