module.exports = async function findUserCampaignParticipationOverviews({ userId, states, campaignParticipationOverviewRepository }) {
  if (states && states.length > 0) {
    const newStates = [].concat(states);
    return campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states: newStates });
  }

  return campaignParticipationOverviewRepository.findAllByUserId(userId);
};
