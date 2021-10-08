module.exports = async function getCampaignManagement({ campaignId, campaignManagementRepository }) {
  return campaignManagementRepository.get(campaignId);
};
