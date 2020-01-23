module.exports = function findPaginatedOrganizationCampaigns({ organizationId, page, campaignRepository }) {
  return campaignRepository.findPaginatedByOrganizationIdWithCampaignReports({ organizationId, page });
};
