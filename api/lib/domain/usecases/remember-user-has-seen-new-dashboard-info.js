module.exports = function rememberUserHasSeenNewDashboardInfo({
  userId,
  userRepository,
}) {
  return userRepository.updateHasSeenNewDashboardInfoToTrue(userId);
};
