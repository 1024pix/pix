const updateTargetProfile = async function ({
  id,
  attributesToUpdate,
  targetProfileForAdminRepository,
  targetProfileForUpdateRepository,
  domainTransaction,
}) {
  const targetProfileForAdmin = await targetProfileForAdminRepository.get({ id, domainTransaction });

  targetProfileForAdmin.update(attributesToUpdate);

  return targetProfileForUpdateRepository.update(targetProfileForAdmin, domainTransaction);
};

export { updateTargetProfile };
