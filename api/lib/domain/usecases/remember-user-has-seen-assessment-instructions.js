module.exports = function rememberUserHasSeenAssessmentInstructions({
  userId,
  userRepository,
}) {
  return userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);
};
