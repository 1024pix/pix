import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
import { MembershipNotFound } from '../errors.js';

export async function getOrganizationMembership({
  userId,
  organizationId,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (memberships.length === 0) throw new MembershipNotFound();

  return memberships.at(0);
}
