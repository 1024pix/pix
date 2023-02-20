import campaignCodeGenerator from '../services/campaigns/campaign-code-generator';

export default async function createCampaign({ campaign, campaignRepository, campaignCreatorRepository }) {
  const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
  const campaignCreator = await campaignCreatorRepository.get({
    userId: campaign.creatorId,
    organizationId: campaign.organizationId,
    ownerId: campaign.ownerId,
  });

  const campaignForCreation = campaignCreator.createCampaign({ ...campaign, code: generatedCampaignCode });

  return campaignRepository.save(campaignForCreation);
}
