module.exports = async function dissociateSchoolingRegistrations({
  userId,
  schoolingRegistrationRepository,
  userRepository,
}) {
  await schoolingRegistrationRepository.dissociateByUser(userId);

  const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userId);

  const foundSchoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });
  userDetailsForAdmin.isAssociatedWithSchoolingRegistration = foundSchoolingRegistrations.length > 0;

  return userDetailsForAdmin;
};
