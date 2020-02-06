module.exports = function findPaginatedFilteredOrganizationCampaigns({ organizationId, filter, page, campaignRepository }) {
  return campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });
};
