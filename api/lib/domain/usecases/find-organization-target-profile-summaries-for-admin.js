export default function findOrganizationTargetProfileSummariesForAdmin({
  organizationId,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findByOrganization({ organizationId });
}
