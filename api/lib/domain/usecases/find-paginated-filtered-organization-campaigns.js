module.exports = function findPaginatedFilteredOrganizationCampaigns({
  userId,
  organizationId,
  filter,
  page,
  campaignReportRepository,
}) {
  return campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page, userId });
};
