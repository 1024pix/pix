module.exports = async function rememberUserHasSeenAssessmentInstructions({
  userId,
  userRepository
}) {
  const user = await userRepository.get(userId);
  user.hasSeenAssessmentInstructions = true;

  return userRepository.updateUser(user);
};
