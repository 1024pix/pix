const unarchiveCampaign = async function ({ campaignId, campaignAdministrationRepository }) {
  const campaign = await campaignAdministrationRepository.get(campaignId);
  campaign.unarchive();
  await campaignAdministrationRepository.update(campaign);
  return campaign;
};

export { unarchiveCampaign };
