import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js'; /**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const rememberUserHasSeenLastDataProtectionPolicyInformation = function ({
  userId,
  userRepository = injectedUserRepository,
} = {}) {
  return userRepository.updateLastDataProtectionPolicySeenAt({ userId });
};
