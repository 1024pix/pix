module.exports = async function updateUserHasSeenMigrationModal({
  userId,
  userRepository
}) {
  const user = await userRepository.get(userId);

  user.hasSeenMigrationModal = true;

  return userRepository.updateUser(user);
};
