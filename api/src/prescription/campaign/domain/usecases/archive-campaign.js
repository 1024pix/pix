const archiveCampaign = async function ({ campaignId, userId, campaignAdministrationRepository }) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  campaign.archive(new Date(), userId);
  await campaignAdministrationRepository.update(campaign);
  return campaign;
};

export { archiveCampaign };
