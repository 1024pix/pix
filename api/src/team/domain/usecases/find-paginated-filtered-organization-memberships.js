/**
 * @param {{
 *   organizationId: string,
 *   filter: number,
 *   page: number,
 *   membershipRepository: MembershipRepository
 * }} params
 * @returns {*}
 */
const findPaginatedFilteredOrganizationMemberships = function ({ organizationId, filter, page, membershipRepository }) {
  return membershipRepository.findPaginatedFiltered({ organizationId, filter, page });
};

export { findPaginatedFilteredOrganizationMemberships };
