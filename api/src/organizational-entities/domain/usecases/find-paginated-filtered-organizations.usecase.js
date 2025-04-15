const findPaginatedFilteredOrganizations = function ({ filter, page, organizationForAdminRepository }) {
  return organizationForAdminRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredOrganizations };
