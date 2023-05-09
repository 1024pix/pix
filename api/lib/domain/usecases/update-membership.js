const updateMembership = async function ({ membership, membershipRepository }) {
  membership.validateRole();
  const existingMembership = await membershipRepository.get(membership.id);

  return membershipRepository.updateById({ id: existingMembership.id, membership });
};

export { updateMembership };
