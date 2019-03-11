module.exports = function getCampaignParticipation({
  campaignParticipationId,
  campaignParticipationRepository,
  options,
}) {
  return campaignParticipationRepository.get(campaignParticipationId, options);
};
