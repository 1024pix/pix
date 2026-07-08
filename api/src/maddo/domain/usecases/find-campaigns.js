export async function findCampaigns({ organizationId, campaignRepository, page }) {
  return campaignRepository.findByOrganizationId(organizationId, page);
}
