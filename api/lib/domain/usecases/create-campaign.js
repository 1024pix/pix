const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator.js');

module.exports = async function createCampaign({ campaign, campaignRepository, campaignCreatorRepository }) {
  const generatedCampaignCode = await campaignCodeGenerator.generate(campaignRepository);
  const campaignCreator = await campaignCreatorRepository.get({
    userId: campaign.creatorId,
    organizationId: campaign.organizationId,
    ownerId: campaign.ownerId,
  });

  const campaignForCreation = campaignCreator.createCampaign({ ...campaign, code: generatedCampaignCode });

  return campaignRepository.save(campaignForCreation);
};
