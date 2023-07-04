const createCampaigns = async function ({ userId, campaignAdministrationRepository }) {
  campaignAdministrationRepository.createCampaigns(userId);
  return;
};

export { createCampaigns };
