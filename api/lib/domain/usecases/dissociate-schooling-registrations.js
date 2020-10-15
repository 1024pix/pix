module.exports = async function dissociateSchoolingRegistrations({
  userId,
  schoolingRegistrationRepository,
  userRepository,
}) {
  await schoolingRegistrationRepository.dissociateByUser(userId);

  return await userRepository.getUserDetailsForAdmin(userId);
};
