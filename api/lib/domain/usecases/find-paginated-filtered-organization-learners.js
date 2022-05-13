module.exports = function findPaginatedFilteredOrganizationLearners({
  organizationId,
  filter,
  page,
  organizationLearnerRepository,
}) {
  return organizationLearnerRepository.findPaginatedFilteredOrganizationLearners({
    organizationId,
    filter,
    page,
  });
};
