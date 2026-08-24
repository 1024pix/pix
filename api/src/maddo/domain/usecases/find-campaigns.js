export async function findCampaigns({ organizationId, campaignRepository, page, withArchived }) {
  return campaignRepository.findByOrganizationId({ organizationId, page, withArchived });
}
