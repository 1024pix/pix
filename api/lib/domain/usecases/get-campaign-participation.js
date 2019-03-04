module.exports = function getCampaignParticipation({ campaignParticipationId, campaignParticipationRepository }) {
  return campaignParticipationRepository.get(campaignParticipationId);
};
