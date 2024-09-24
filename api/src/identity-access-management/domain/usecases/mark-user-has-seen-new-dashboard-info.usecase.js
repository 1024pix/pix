/**
 * @typedef {import ('../../domain/usecases/index.js').UserRepository} UserRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {UserRepository} params.userRepository
 */
const markUserHasSeenNewDashboardInfo = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenNewDashboardInfoToTrue(userId);
};

export { markUserHasSeenNewDashboardInfo };
