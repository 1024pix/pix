const getOrganizationLearnerFilters = async ({ organizationId, organizationLearnerFilterRepository }) =>
  await organizationLearnerFilterRepository.findByOrganizationId(organizationId);

export { getOrganizationLearnerFilters };
