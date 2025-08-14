import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';
const updateMembership = async function ({ membership, membershipRepository = injectedMembershipRepository } = {}) {
  membership.validateRole();
  const existingMembership = await membershipRepository.get(membership.id);

  return membershipRepository.updateById({ id: existingMembership.id, membership });
};

export { updateMembership };
