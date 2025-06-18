export async function getCampaignParticipations({ campaignId, clientId, page, campaignParticipationRepository }) {
  return campaignParticipationRepository.findByCampaignId(campaignId, clientId, page);
}
