module.exports = async function updateUserDetailsForAdministration({
  userId,
  userDetailsForAdministration,
  userRepository,
  schoolingRegistrationRepository,
}) {
  await userRepository.isEmailAllowedToUseForCurrentUser(userId, userDetailsForAdministration.email);

  const userDetailsForAdmin = await userRepository.updateUserDetailsForAdministration(userId, userDetailsForAdministration);

  const foundSchoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });
  userDetailsForAdmin.isAssociatedWithSchoolingRegistration = foundSchoolingRegistrations.length > 0;

  return userDetailsForAdmin;
};
