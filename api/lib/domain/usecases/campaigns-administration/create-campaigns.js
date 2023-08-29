import { CampaignTypes } from '../../models/CampaignTypes.js';

const createCampaigns = async function ({
  campaignsToCreate,
  membershipRepository,
  campaignRepository,
  campaignCreatorRepository,
  campaignCodeGenerator,
}) {
  const enrichedCampaignsData = await Promise.all(
    campaignsToCreate.map(async (campaign) => {
      const [administrator] = await membershipRepository.findAdminsByOrganizationId({
        organizationId: campaign.organizationId,
      });

      const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
      const campaignCreator = await campaignCreatorRepository.get({
        userId: campaign.creatorId,
        organizationId: campaign.organizationId,
        ownerId: administrator.user.id,
      });

      return campaignCreator.createCampaign({
        ...campaign,
        type: CampaignTypes.ASSESSMENT,
        code: generatedCampaignCode,
        ownerId: administrator.user.id,
      });
    }),
  );

  return campaignRepository.save(enrichedCampaignsData);
};

export { createCampaigns };
