import { ForbiddenError } from '../../../shared/application/http-errors.js';
import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.membershipId
 * @param {MembershipRepository} params.membershipRepository
 */
const updateMembershipLastAccessedAt = async function ({
  userId,
  membershipId,
  membershipRepository = injectedMembershipRepository,
} = {}) {
  const membership = await membershipRepository.get(membershipId);
  if (membership.user.id !== userId || membership.disabledAt) {
    throw new ForbiddenError();
  }

  return membershipRepository.updateLastAccessedAt({
    membershipId,
    lastAccessedAt: new Date(),
  });
};

export { updateMembershipLastAccessedAt };
