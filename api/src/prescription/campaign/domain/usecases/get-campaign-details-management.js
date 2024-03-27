const getCampaignManagement = async function ({ campaignId, campaignManagementRepository }) {
  return campaignManagementRepository.get(campaignId);
};

export { getCampaignManagement };
