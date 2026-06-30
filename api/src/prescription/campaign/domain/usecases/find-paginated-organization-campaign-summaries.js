const findPaginatedOrganizationCampaignSummaries = async ({ organizationId, page, campaignReportRepository }) =>
  await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
    organizationId,
    page,
  });

export { findPaginatedOrganizationCampaignSummaries };
