const findPaginatedCampaignManagements = function ({ organizationId, page, campaignManagementRepository }) {
  return campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });
};

export { findPaginatedCampaignManagements };
