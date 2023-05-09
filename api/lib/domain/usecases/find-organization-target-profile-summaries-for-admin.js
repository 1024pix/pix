const findOrganizationTargetProfileSummariesForAdmin = function ({
  organizationId,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findByOrganization({ organizationId });
};

export { findOrganizationTargetProfileSummariesForAdmin };
