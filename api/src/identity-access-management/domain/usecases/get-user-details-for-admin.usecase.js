import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js'; /**
 * @param {Object} params
 * @param {string} params.userId
 * @param {UserRepository} userRepository
 * @throws UserNotFoundError
 * @returns {Promise<UserDetailsForAdmin>}
 */
const getUserDetailsForAdmin = async function ({ userId, userRepository = injectedUserRepository } = {}) {
  return await userRepository.getUserDetailsForAdmin(userId);
};

export { getUserDetailsForAdmin };
