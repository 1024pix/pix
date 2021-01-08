module.exports = async function findUserCampaignParticipationOverviews({ userId, states, campaignParticipationOverviewRepository, page }) {
  const concatenatedStates = states ? [].concat(states) : undefined;
  return campaignParticipationOverviewRepository.findByUserIdWithFilters({
    userId,
    states: concatenatedStates,
    page,
  });
};
