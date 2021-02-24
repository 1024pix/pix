module.exports = async function findTargetProfileStages(
  {
    targetProfileId,
    stageRepository,
  }) {
  return stageRepository.findByTargetProfileId(targetProfileId);
};
