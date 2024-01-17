import { CampaignTypes } from '../../../shared/domain/constants.js';

const createCampaigns = async function ({
  campaignsToCreate,
  membershipRepository,
  campaignAdministrationRepository,
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

      const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);
      const campaignCreator = await campaignCreatorRepository.get(campaign.organizationId);

      return campaignCreator.createCampaign({
        ...campaign,
        type: CampaignTypes.ASSESSMENT,
        code: generatedCampaignCode,
        ownerId,
      });
    }),
  );

  return campaignAdministrationRepository.save(enrichedCampaignsData);
};

export { createCampaigns };
