module.exports = async function findUserCampaignParticipationOverviews({ userId, state, campaignParticipationOverviewRepository }) {
  if (state === 'ONGOING') {
    return campaignParticipationOverviewRepository.findOngoingByUserId(userId);
  }

  return campaignParticipationOverviewRepository.findAllByUserId(userId);
};
