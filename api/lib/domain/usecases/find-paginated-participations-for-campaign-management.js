module.exports = function findPaginatedParticipationsForCampaignManagement({
  campaignId,
  page,
  participationsForCampaignManagementRepository,
}) {
  return participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
    campaignId,
    page,
  });
};
