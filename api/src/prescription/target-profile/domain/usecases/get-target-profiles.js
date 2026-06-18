const getTargetProfiles = async function ({ targetProfileIds, targetProfileRepository }) {
  return targetProfileRepository.findByIds(targetProfileIds);
};

export { getTargetProfiles };
