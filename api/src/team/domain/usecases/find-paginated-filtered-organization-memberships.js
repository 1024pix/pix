import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js'; /**
 * @param {{
 *   organizationId: string,
 *   filter: number,
 *   page: number,
 *   membershipRepository: MembershipRepository
 * }} params
 * @returns {*}
 */
const findPaginatedFilteredOrganizationMemberships = function ({
  organizationId,
  filter,
  page,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  return membershipRepository.findPaginatedFiltered({ organizationId, filter, page });
};

export { findPaginatedFilteredOrganizationMemberships };
