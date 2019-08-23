module.exports = async function findCampaignParticipationsRelatedToUser({ userId, campaignParticipationRepository }) {
  return campaignParticipationRepository.findByUserId(userId);
};
