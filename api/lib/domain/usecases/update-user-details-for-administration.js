module.exports = async function updateUserDetailsForAdministration({
  userId,
  userDetailsForAdministration,
  userRepository,
}) {
  if (userDetailsForAdministration.email) {
    await userRepository.isEmailAllowedToUseForCurrentUser(userId, userDetailsForAdministration.email);
  }

  await userRepository.updateUserDetailsForAdministration(userId, userDetailsForAdministration);

  return await userRepository.getUserDetailsForAdmin(userId);
};
