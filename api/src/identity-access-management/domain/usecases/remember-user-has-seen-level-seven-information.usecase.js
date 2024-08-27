/**
 * @typedef {import ('../../domain/usecases/index.js').UserRepository} UserRepository
 */

/**
 * @param {Object} params
 * @param {UserRepository} params.userRepository
 */
const rememberUserHasSeenLevelSevenInformation = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenLevelSevenInfoToTrue(userId);
};

export { rememberUserHasSeenLevelSevenInformation };
