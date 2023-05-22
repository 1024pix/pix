const unarchiveCampaign = async function ({ campaignId, campaignForArchivingRepository }) {
  const campaign = await campaignForArchivingRepository.get(campaignId);
  campaign.unarchive();
  await campaignForArchivingRepository.save(campaign);
  return campaign;
};

export { unarchiveCampaign };
