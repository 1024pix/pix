const findOrganizationTargetProfileSummariesForAdmin = function ({
  organizationId,
  targetProfileAdministrationRepository,
}) {
  return targetProfileAdministrationRepository.findByOrganization({ organizationId });
};

export { findOrganizationTargetProfileSummariesForAdmin };
