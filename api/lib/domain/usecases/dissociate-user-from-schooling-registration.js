module.exports = async function dissociateUserFromSchoolingRegistration({
  schoolingRegistrationId,
  schoolingRegistrationRepository,
}) {
  await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistrationId);
};
