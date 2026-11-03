export async function getCampaignOverview({ campaignId, campaignOverviewRepository }) {
  return campaignOverviewRepository.get({ campaignId });
}
