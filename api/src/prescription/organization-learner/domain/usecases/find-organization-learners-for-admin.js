const findOrganizationLearnersForAdmin = async function ({ page, filter, organizationLearnerRepository }) {
  return organizationLearnerRepository.findPaginatedLearnersForAdmin({ page, filter });
};

export { findOrganizationLearnersForAdmin };
