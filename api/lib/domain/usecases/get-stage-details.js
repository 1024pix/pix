module.exports = function getStageDetails({
  stageId,
  stageRepository,
}) {
  return stageRepository.get(stageId);
};
