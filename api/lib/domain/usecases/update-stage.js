module.exports = function updateStage({
  stageId,
  title,
  message,
  threshold,
  level,
  prescriberTitle,
  prescriberDescription,
  stageRepository,
}) {
  return stageRepository.updateStage({
    id: stageId,
    title,
    message,
    threshold,
    level,
    prescriberTitle,
    prescriberDescription,
  });
};
