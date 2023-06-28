const findLatestOngoingUserCampaignParticipations = async function ({ userId, campaignParticipationRepository }) {
  return campaignParticipationRepository.findLatestOngoingByUserId(userId);
};

export { findLatestOngoingUserCampaignParticipations };
