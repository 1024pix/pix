const rememberUserHasSeenAssessmentInstructions = function ({ userId, userRepository }) {
  return userRepository.updateAssessmentInstructionsInfoAsSeen({ userId });
};

export { rememberUserHasSeenAssessmentInstructions };
