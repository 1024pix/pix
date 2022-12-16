module.exports = function findPaginatedFilteredOrganizations({ filter, page, organizationRepository }) {
  return organizationRepository.findPaginatedFiltered({ filter, page });
};
