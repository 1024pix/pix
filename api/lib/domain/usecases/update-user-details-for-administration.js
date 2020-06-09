module.exports = async function updateUserDetailsForAdministration({
  userId,
  userDetailsForAdministration,
  userRepository,
}) {

  await userRepository.isEmailAllowedToUseForCurrentUser(userId, userDetailsForAdministration.email);

  return userRepository.updateUserDetailsForAdministration(userId, userDetailsForAdministration);

};
