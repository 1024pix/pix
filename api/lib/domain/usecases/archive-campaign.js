const archiveCampaign = async function ({ campaignId, userId, campaignForArchivingRepository }) {
  const campaign = await campaignForArchivingRepository.get(campaignId);
  campaign.archive(new Date(), userId);
  await campaignForArchivingRepository.save(campaign);
  return campaign;
};

export { archiveCampaign };
