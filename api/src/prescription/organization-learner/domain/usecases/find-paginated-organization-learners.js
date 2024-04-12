const findPaginatedOrganizationLearners = async function ({ organizationId, page, organizationLearnerRepository }) {
  return organizationLearnerRepository.findPaginatedLearners({ organizationId, page });
};

export { findPaginatedOrganizationLearners };
