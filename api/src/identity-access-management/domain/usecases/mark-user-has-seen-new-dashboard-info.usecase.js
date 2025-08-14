import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').UserRepository} UserRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {UserRepository} params.userRepository
 */
const markUserHasSeenNewDashboardInfo = function ({ userId, userRepository = injectedUserRepository } = {}) {
  return userRepository.updateHasSeenNewDashboardInfoToTrue(userId);
};

export { markUserHasSeenNewDashboardInfo };
