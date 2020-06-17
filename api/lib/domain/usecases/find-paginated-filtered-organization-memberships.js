module.exports = function findPaginatedFilteredOrganizationMemberships({ organizationId, filter, page, membershipRepository }) {
  return membershipRepository.findPaginatedFiltered({ organizationId, filter, page });
};
