const findPaginatedOrganizationLearners = async function ({
  organizationId,
  page,
  filter,
  organizationLearnerRepository,
}) {
  return organizationLearnerRepository.findPaginatedLearners({ organizationId, page, filter });
};

export { findPaginatedOrganizationLearners };
