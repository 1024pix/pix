const archiveCampaigns = async function ({ userId, campaignIds, campaignAdministrationRepository }) {
  await campaignAdministrationRepository.archiveCampaigns(campaignIds, userId);
};

export { archiveCampaigns };
