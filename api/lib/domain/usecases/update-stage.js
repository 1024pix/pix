module.exports = function updateStage({
  stageId,
  prescriberTitle,
  prescriberDescription,
  stageRepository,
}) {
  return stageRepository.updateStagePrescriberAttributes({ id: stageId, prescriberTitle, prescriberDescription });
};
