/**
 * @typedef {import ('../../domain/usecases/index.js').UserRepository} UserRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {UserRepository} params.userRepository
 */
const markAssessmentInstructionsInfoAsSeen = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);
};

export { markAssessmentInstructionsInfoAsSeen };
