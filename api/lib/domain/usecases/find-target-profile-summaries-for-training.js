export default function findTargetProfileSummariesForTraining({ trainingId, targetProfileSummaryForAdminRepository }) {
  return targetProfileSummaryForAdminRepository.findByTraining({ trainingId });
}
