const rememberUserHasSeenAssessmentInstructions = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);
};

export { rememberUserHasSeenAssessmentInstructions };
