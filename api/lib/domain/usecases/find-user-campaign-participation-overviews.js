module.exports = async function findUserCampaignParticipationOverviews({ userId, campaignParticipationOverviewRepository }) {
  return campaignParticipationOverviewRepository.findByUserId(userId);
};
