const updateTargetProfile = async function ({
  id,
  attributesToUpdate,
  targetProfileForAdminRepository,
  targetProfileForUpdateRepository,
}) {
  const targetProfileForAdmin = await targetProfileForAdminRepository.get({ id });

  targetProfileForAdmin.update(attributesToUpdate);

  return targetProfileForUpdateRepository.update(targetProfileForAdmin);
};

export { updateTargetProfile };
