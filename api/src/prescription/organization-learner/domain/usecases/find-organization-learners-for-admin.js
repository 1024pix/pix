const findOrganizationLearnersForAdmin = async function ({ page, filter, sort, organizationLearnerRepository }) {
  return organizationLearnerRepository.findPaginatedLearnersForAdmin({ page, filter, sort });
};

export { findOrganizationLearnersForAdmin };
