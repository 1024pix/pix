const findPaginatedParticipationsForCampaignManagement = function ({
  campaignId,
  page,
  participationsForCampaignManagementRepository,
}) {
  return participationsForCampaignManagementRepository.findPaginatedParticipationsForCampaignManagement({
    campaignId,
    page,
  });
};

export { findPaginatedParticipationsForCampaignManagement };
