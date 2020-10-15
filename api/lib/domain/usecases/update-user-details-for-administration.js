module.exports = async function updateUserDetailsForAdministration({
  userId,
  userDetailsForAdministration,
  userRepository,
}) {
  await userRepository.isEmailAllowedToUseForCurrentUser(userId, userDetailsForAdministration.email);

  await userRepository.updateUserDetailsForAdministration(userId, userDetailsForAdministration);

  return await userRepository.getUserDetailsForAdmin(userId);
};
