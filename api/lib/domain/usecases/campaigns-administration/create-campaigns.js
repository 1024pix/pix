import { CampaignTypes } from '../../models/CampaignTypes.js';

const createCampaigns = async function ({
  campaignsToCreate,
  membershipRepository,
  campaignRepository,
  campaignCreatorRepository,
  codeGenerator,
}) {
  const enrichedCampaignsData = await Promise.all(
    campaignsToCreate.map(async (campaign) => {
      let ownerId;
      if (campaign.ownerId) {
        ownerId = campaign.ownerId;
      } else {
        const [administrator] = await membershipRepository.findAdminsByOrganizationId({
          organizationId: campaign.organizationId,
        });
        ownerId = administrator.user.id;
      }

      const generatedCampaignCode = await codeGenerator.generate(campaignRepository);
      const campaignCreator = await campaignCreatorRepository.get({
        userId: campaign.creatorId,
        organizationId: campaign.organizationId,
        shouldOwnerBeFromOrganization: false,
      });

      return campaignCreator.createCampaign({
        ...campaign,
        type: CampaignTypes.ASSESSMENT,
        code: generatedCampaignCode,
        ownerId,
      });
    }),
  );

  return campaignRepository.save(enrichedCampaignsData);
};

export { createCampaigns };
