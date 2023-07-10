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
      const [administrator] = await membershipRepository.findAdminsByOrganizationId({
        organizationId: campaign.organizationId,
      });

      return {
        ...campaign,
        ownerId: administrator.user.id,
        creatorId,
        code: await campaignCodeGenerator.generate(campaignRepository),
      };
    })
  );

  return campaignAdministrationRepository.createCampaigns(enrichedCampaignsData);
};

export { createCampaigns };
