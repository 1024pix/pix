module.exports = function getCampaignManagement({
  campaignId,
  campaignManagementRepository,
}) {
  return campaignManagementRepository.get(campaignId);
};
