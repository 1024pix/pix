export default function rememberUserHasSeenAssessmentInstructions({ userId, userRepository }) {
  return userRepository.updateHasSeenAssessmentInstructionsToTrue(userId);
}
