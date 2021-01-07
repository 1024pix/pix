module.exports = async function findUserCampaignParticipationOverviews({ userId, states, campaignParticipationOverviewRepository, page }) {
  const newStates = states ? [].concat(states) : undefined;
  return campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states: newStates, page });
};
