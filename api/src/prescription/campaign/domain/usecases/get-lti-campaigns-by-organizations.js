export async function getLtiCampaignsByOrganizations({ organizationIds, ltiCampaignRepository }) {
  return ltiCampaignRepository.getAllByOrganizationIds({ organizationIds });
}
