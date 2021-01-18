module.exports = function findPaginatedFilteredOrganizationCampaigns({ organizationId, filter, page, campaignReportRepository }) {
  return campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page });
};
