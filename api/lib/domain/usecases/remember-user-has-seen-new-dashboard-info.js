const rememberUserHasSeenNewDashboardInfo = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenNewDashboardInfoToTrue(userId);
};

export { rememberUserHasSeenNewDashboardInfo };
