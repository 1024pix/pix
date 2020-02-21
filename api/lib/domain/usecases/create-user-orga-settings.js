module.exports = async function createUserOrgaSettings({
  organizationId,
  userId,
  userRepository,
  organizationRepository,
  userOrgaSettingsRepository
}) {

  await userRepository.get(userId);
  await organizationRepository.get(organizationId);

  return userOrgaSettingsRepository.create(userId, organizationId);
};
