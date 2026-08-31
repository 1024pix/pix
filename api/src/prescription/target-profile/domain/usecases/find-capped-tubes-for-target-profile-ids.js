export const findCappedTubesForTargetProfileIds = async ({ targetProfileIds, targetProfileRepository }) => {
  return targetProfileRepository.findCappedTubesForTargetProfileIds({ targetProfileIds });
};
