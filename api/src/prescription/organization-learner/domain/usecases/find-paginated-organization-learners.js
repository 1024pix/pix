const findPaginatedOrganizationLearners = async function ({
  organizationId,
  page,
  filter,
  organizationLearnerRepository,
}) {
  return organizationLearnerRepository.findPaginatedLearnersByOrganizationId({ organizationId, page, filter });
};

export { findPaginatedOrganizationLearners };
