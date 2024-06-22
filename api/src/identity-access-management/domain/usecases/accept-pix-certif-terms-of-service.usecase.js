/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixCertifTermsOfService = function ({ userId, userRepository }) {
  return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
};
