module.exports = function findOrganizationTargetProfileSummariesForAdmin({
  organizationId,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findByOrganization({ organizationId });
};
