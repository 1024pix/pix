const updateTargetProfile = async function ({
  id,
  attributesToUpdate,
  targetProfileAdministrationRepository,
  targetProfileForUpdateRepository,
}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id });

  targetProfileForAdmin.update(attributesToUpdate);

  return targetProfileForUpdateRepository.update(targetProfileForAdmin);
};

export { updateTargetProfile };
