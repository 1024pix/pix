const createCampaign = async function ({ campaign, campaignRepository, campaignCreatorRepository, codeGenerator }) {
  const generatedCampaignCode = await codeGenerator.generate(campaignRepository);
  const campaignCreator = await campaignCreatorRepository.get({
    userId: campaign.creatorId,
    organizationId: campaign.organizationId,
    ownerId: campaign.ownerId,
  });

  const campaignForCreation = campaignCreator.createCampaign({ ...campaign, code: generatedCampaignCode });

  return campaignRepository.save(campaignForCreation);
};

export { createCampaign };
