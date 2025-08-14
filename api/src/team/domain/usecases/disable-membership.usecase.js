import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
const disableMembership = async function ({
  membershipId,
  userId,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  const membership = { disabledAt: new Date(), updatedByUserId: userId };
  return membershipRepository.updateById({ id: membershipId, membership });
};

export { disableMembership };
