module.exports = function rememberUserHasSeenNewLevelInfo({
  userId,
  userRepository,
}) {
  return userRepository.updateHasSeenNewLevelInfoToTrue(userId);
};
