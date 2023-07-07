const createCampaigns = async function ({
  campaignsToCreate,
  creatorId,
  campaignAdministrationRepository,
  membershipRepository,
  campaignRepository,
  campaignCodeGenerator,
}) {
  const enrichedCampaignsData = await Promise.all(
    campaignsToCreate.map(async (campaign) => {
      const [administrator] = await membershipRepository.findAdminsByOrganizationId(campaign.organizationId);

      return {
        ...campaign,
        ownerId: administrator.id,
        creatorId,
        code: await campaignCodeGenerator.generate(campaignRepository),
      };
    })
  );

  return campaignAdministrationRepository.createCampaigns(enrichedCampaignsData);
};

export { createCampaigns };
