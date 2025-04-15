const getTargetProfile = async function ({ targetProfileId, targetProfileRepository }) {
  return targetProfileRepository.get(targetProfileId);
};

export { getTargetProfile };
