import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js'; /**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixLastTermsOfService = function ({ userId, userRepository = injectedUserRepository } = {}) {
  return userRepository.acceptPixLastTermsOfService(userId);
};
