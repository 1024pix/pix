const findPaginatedFilteredOrganizationMemberships = function ({ organizationId, filter, page, membershipRepository }) {
  return membershipRepository.findPaginatedFiltered({ organizationId, filter, page });
};

export { findPaginatedFilteredOrganizationMemberships };
