const getTargetProfileForAdmin = async function ({ targetProfileId, targetProfileAdminRepository }) {
  return targetProfileAdminRepository.get({ id: targetProfileId });
};

export { getTargetProfileForAdmin };
