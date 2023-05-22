const findPaginatedFilteredOrganizations = function ({ filter, page, organizationRepository }) {
  return organizationRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredOrganizations };
