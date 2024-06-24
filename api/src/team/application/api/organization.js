import { usecases } from '../../domain/usecases/index.js';
import { OrganizationMembership } from './models/organization-membership.js';

/**
 * @module OrganizationApi
 */

/**
 * @function
 *
 * @param {number} organizationId
 * @param {number} userId
 * @returns {Promise<OrganizationMembership>}
 * @throws {MembershipNotFound}
 */
export async function getOrganizationMembership({
  userId,
  organizationId,
  dependencies = { getOrganizationMembership: usecases.getOrganizationMembership },
}) {
  const membership = await dependencies.getOrganizationMembership({ userId, organizationId });

  return new OrganizationMembership(membership.organizationRole);
}
