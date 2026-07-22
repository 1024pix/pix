const findPaginatedOrganizationCampaignSummaries = async ({
  organizationId,
  withTargetProfileName,
  withArchived,
  page,
  campaignReportRepository,
}) =>
  await campaignReportRepository.findAllPaginatedSummariesByOrganizationId({
    organizationId,
    withTargetProfileName,
    withArchived,
    page,
  });

export { findPaginatedOrganizationCampaignSummaries };
