const createCampaigns = async function ({ campaignsToCreate, userId, campaignAdministrationRepository }) {
  await campaignAdministrationRepository.createCampaigns(campaignsToCreate, userId);
  return;
};

export { createCampaigns };
