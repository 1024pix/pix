/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixLastTermsOfService = function ({ userId, userRepository }) {
  return userRepository.acceptPixLastTermsOfService(userId);
};
