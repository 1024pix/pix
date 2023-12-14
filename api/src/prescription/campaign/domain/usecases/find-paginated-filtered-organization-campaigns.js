const findPaginatedFilteredOrganizationCampaigns = function ({
  userId,
  organizationId,
  filter,
  page,
  campaignReportRepository,
}) {
  return campaignReportRepository.findPaginatedFilteredByOrganizationId({ organizationId, filter, page, userId });
};

export { findPaginatedFilteredOrganizationCampaigns };
