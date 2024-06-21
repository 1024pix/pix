export async function getOrganizationMembership({ userId, organizationId, membershipRepository }) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });
  return memberships.at(0);
}
