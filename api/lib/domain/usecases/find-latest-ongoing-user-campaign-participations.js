module.exports = async function findLatestOngoingUserCampaignParticipations({ userId, campaignParticipationRepository }) {
  return campaignParticipationRepository.findLatestOngoingByUserId(userId);
};
