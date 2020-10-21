module.exports = async function dissociateSchoolingRegistrations({
  userId,
  schoolingRegistrationRepository,
  userRepository,
}) {
  const scoSchoolingRegistrations = await schoolingRegistrationRepository.findByUserIdAndSCOOrganization({ userId });

  if (scoSchoolingRegistrations.length > 0) {
    const scoSchoolingRegistrationIds = scoSchoolingRegistrations.map((scoSchoolingRegistration) => scoSchoolingRegistration.id);
    await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistrationIds(scoSchoolingRegistrationIds);
  }

  return await userRepository.getUserDetailsForAdmin(userId);
};
