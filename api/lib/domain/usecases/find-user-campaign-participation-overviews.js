module.exports = async function findUserCampaignParticipationOverviews({ userId, states, campaignParticipationOverviewRepository }) {
  if (states && states.length > 0) {
    return campaignParticipationOverviewRepository.findByUserIdWithFilters({ userId, states });
  }

  return campaignParticipationOverviewRepository.findAllByUserId(userId);
};
