module.exports = function findTargetProfileStages(
  {
    targetProfileId,
    stageRepository,
  }) {
  return stageRepository.findByTargetProfileId(targetProfileId);
};
