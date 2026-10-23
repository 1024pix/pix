export async function getLtiCampaignsByOrganizations({ organizationIds, ltiCampaignRepository }) {
  return ltiCampaignRepository.getLtiCampaigns({ organizationIds });
}
