module.exports = async function dissociateSchoolingRegistrations({
  userId,
  schoolingRegistrationRepository,
  userRepository,
}) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (schoolingRegistrations.length > 0) {
    const schoolingRegistrationIds = schoolingRegistrations.map((schoolingRegistration) => schoolingRegistration.id);
    await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistrationIds(schoolingRegistrationIds);
  }

  return await userRepository.getUserDetailsForAdmin(userId);
};
