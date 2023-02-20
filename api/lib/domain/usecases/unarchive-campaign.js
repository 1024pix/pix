export default async function unarchiveCampaign({ campaignId, campaignForArchivingRepository }) {
  const campaign = await campaignForArchivingRepository.get(campaignId);
  campaign.unarchive();
  await campaignForArchivingRepository.save(campaign);
  return campaign;
}
