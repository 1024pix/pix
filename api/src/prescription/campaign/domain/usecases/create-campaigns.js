import { CampaignTypes } from '../../../shared/domain/constants.js';

const createCampaigns = async function ({
  campaignsToCreate,
  campaignAdministrationRepository,
  campaignCreatorRepository,
  codeGenerator,
}) {
  const enrichedCampaignsData = await Promise.all(
    campaignsToCreate.map(async (campaign) => {
      const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);
      const campaignCreator = await campaignCreatorRepository.get(campaign.organizationId);

      return campaignCreator.createCampaign({
        ...campaign,
        type: CampaignTypes.ASSESSMENT,
        code: generatedCampaignCode,
      });
    }),
  );

  return campaignAdministrationRepository.save(enrichedCampaignsData);
};

export { createCampaigns };
