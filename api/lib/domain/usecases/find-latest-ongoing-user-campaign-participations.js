export default async function findLatestOngoingUserCampaignParticipations({ userId, campaignParticipationRepository }) {
  return campaignParticipationRepository.findLatestOngoingByUserId(userId);
}
