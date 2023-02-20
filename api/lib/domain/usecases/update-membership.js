export default async function updateMembership({ membership, membershipRepository }) {
  membership.validateRole();
  const existingMembership = await membershipRepository.get(membership.id);

  return membershipRepository.updateById({ id: existingMembership.id, membership });
}
