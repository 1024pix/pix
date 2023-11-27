const createCampaign = async function ({
  campaign,
  campaignAdministrationRepository,
  campaignCreatorRepository,
  codeGenerator,
}) {
  const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);
  const campaignCreator = await campaignCreatorRepository.get({
    userId: campaign.creatorId,
    organizationId: campaign.organizationId,
    ownerId: campaign.ownerId,
  });

  const campaignForCreation = campaignCreator.createCampaign({ ...campaign, code: generatedCampaignCode });

  return campaignAdministrationRepository.save(campaignForCreation);
};

export { createCampaign };
