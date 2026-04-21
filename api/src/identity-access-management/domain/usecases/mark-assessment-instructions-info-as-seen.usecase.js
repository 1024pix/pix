/**
 * @typedef {import ('../../domain/usecases/index.js').UserRepository} UserRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId - The ID of the user whose info is being marked as seen
 * @param {UserRepository} params.userRepository
 * @returns {Promise<void>}
 */
const markAssessmentInstructionsInfoAsSeen = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);
};

export { markAssessmentInstructionsInfoAsSeen };
