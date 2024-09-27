const rememberUserHasSeenNewDashboardInfo = function ({ userId, userRepository }) {
  return userRepository.updateHasSeenNewDashboardInfo({ userId });
};

export { rememberUserHasSeenNewDashboardInfo };
