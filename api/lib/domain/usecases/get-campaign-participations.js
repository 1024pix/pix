module.exports = function findCampaignParticipations({
  options,
  campaignParticipationRepository,
}) {
  if (options.filter.campaignId) {
    return campaignParticipationRepository.findWithUsersPaginated(options);
  }
};
