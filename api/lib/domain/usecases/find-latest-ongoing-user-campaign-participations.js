module.exports = function findLatestOngoingUserCampaignParticipations({ userId, campaignParticipationRepository }) {
  return campaignParticipationRepository.findLatestOngoingByUserId(userId);
};
