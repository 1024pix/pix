/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const rememberUserHasSeenLastDataProtectionPolicyInformation = function ({ userId, userRepository }) {
  return userRepository.updateLastDataProtectionPolicySeenAt({ userId });
};
