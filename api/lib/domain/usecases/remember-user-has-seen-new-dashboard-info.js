export default function rememberUserHasSeenNewDashboardInfo({ userId, userRepository }) {
  return userRepository.updateHasSeenNewDashboardInfoToTrue(userId);
}
