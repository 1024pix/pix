const getOrganizationLearnersGroupedByOrganizations = async function ({
  organizationLearnerIds,
  organizationLearnerRepository,
}) {
  return organizationLearnerRepository.getOrganizationLearnersGroupedByOrganizations({ organizationLearnerIds });
};

export { getOrganizationLearnersGroupedByOrganizations };
