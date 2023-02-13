module.exports = function findTargetProfileSummariesForTraining({
  trainingId,
  targetProfileSummaryForAdminRepository,
}) {
  return targetProfileSummaryForAdminRepository.findByTraining({ trainingId });
};
