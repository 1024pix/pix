export default async function getCampaignManagement({ campaignId, campaignManagementRepository }) {
  return campaignManagementRepository.get(campaignId);
}
