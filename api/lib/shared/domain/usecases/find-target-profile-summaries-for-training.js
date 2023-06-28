const findTargetProfileSummariesForTraining = function ({ trainingId, targetProfileSummaryForAdminRepository }) {
  return targetProfileSummaryForAdminRepository.findByTraining({ trainingId });
};

export { findTargetProfileSummariesForTraining };
