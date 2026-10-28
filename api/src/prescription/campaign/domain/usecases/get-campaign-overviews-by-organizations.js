export async function getCampaignOverviewsByOrganizations({ organizationIds, campaignOverviewRepository }) {
  return campaignOverviewRepository.getAllByOrganizationIds({ organizationIds });
}
