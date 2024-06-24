import { MembershipNotFound } from '../errors.js';

export async function getOrganizationMembership({ userId, organizationId, membershipRepository }) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (memberships.length === 0) throw new MembershipNotFound();

  return memberships.at(0);
}
