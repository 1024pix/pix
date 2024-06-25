/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixOrgaTermsOfService = function ({ userId, userRepository }) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};
