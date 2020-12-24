module.exports = async function findUserCampaignParticipationOverviews({ userId, states, campaignParticipationOverviewRepository, page }) {
  if (states && states.length > 0) {
    const newStates = [].concat(states);
    return campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states: newStates, page });
  }

  return campaignParticipationOverviewRepository.findAllByUserId(userId, page);
};
