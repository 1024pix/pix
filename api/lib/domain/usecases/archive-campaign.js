export default async function archiveCampaign({ campaignId, userId, campaignForArchivingRepository }) {
  const campaign = await campaignForArchivingRepository.get(campaignId);
  campaign.archive(new Date(), userId);
  await campaignForArchivingRepository.save(campaign);
  return campaign;
}
