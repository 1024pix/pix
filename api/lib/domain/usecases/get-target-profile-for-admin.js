const getTargetProfileForAdmin = async function ({ targetProfileId, targetProfileForAdminRepository }) {
  return targetProfileForAdminRepository.get({ id: targetProfileId });
};

export { getTargetProfileForAdmin };
