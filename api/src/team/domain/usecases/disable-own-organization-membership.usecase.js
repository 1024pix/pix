import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
async function disableOwnOrganizationMembership({
  organizationId,
  userId,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({ organizationId, userId });
  return membershipRepository.updateById({
    id: membership.id,
    membership: { disabledAt: new Date(), updatedByUserId: userId },
  });
}

export { disableOwnOrganizationMembership };
