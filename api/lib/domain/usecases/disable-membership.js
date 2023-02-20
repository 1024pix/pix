export default async function disableMembership({ membershipId, userId, membershipRepository }) {
  const membership = { disabledAt: new Date(), updatedByUserId: userId };
  return membershipRepository.updateById({ id: membershipId, membership });
}
