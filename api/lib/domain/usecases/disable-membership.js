module.exports = async function disableMembership({
  membershipId,
  userId,
  membershipRepository,
}) {
  const membershipAttributes = { disabledAt: new Date(), updatedByUserId: userId };
  return membershipRepository.updateById({ id: membershipId, membershipAttributes });
};
