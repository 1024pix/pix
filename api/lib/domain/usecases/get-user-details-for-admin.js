module.exports = async function getUserDetailsForAdmin({
  userId, userRepository, schoolingRegistrationRepository,
}) {
  const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userId);

  const foundSchoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });
  userDetailsForAdmin.isAssociatedWithSchoolingRegistration = foundSchoolingRegistrations.length > 0;

  return userDetailsForAdmin;
};
