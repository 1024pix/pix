async function disableOwnOrganizationMembership({ organizationId, userId, membershipRepository }) {
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({ organizationId, userId });
  return membershipRepository.updateById({
    id: membership.id,
    membership: { disabledAt: new Date(), updatedByUserId: userId },
  });
}

export { disableOwnOrganizationMembership };
