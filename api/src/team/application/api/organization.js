import * as DomainErrors from '../../domain/errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { MembershipNotFound } from './errors/MembershipNotFound.js';
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
  try {
    const membership = await dependencies.getOrganizationMembership({ userId, organizationId });
    return new OrganizationMembership(membership.organizationRole);
  } catch (error) {
    if (error instanceof DomainErrors.MembershipNotFound) {
      throw new MembershipNotFound();
    }
    throw error;
  }
}
