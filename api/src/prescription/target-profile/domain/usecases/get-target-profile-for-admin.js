const getTargetProfileForAdmin = async function ({ targetProfileId, targetProfileAdministrationRepository }) {
  return targetProfileAdministrationRepository.get({ id: targetProfileId });
};

export { getTargetProfileForAdmin };
