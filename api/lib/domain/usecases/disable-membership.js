const disableMembership = async function ({ membershipId, userId, membershipRepository }) {
  const membership = { disabledAt: new Date(), updatedByUserId: userId };
  return membershipRepository.updateById({ id: membershipId, membership });
};

export { disableMembership };
