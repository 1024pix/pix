import * as injectedTargetProfileSummaryForAdminRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-summary-for-admin-repository.js';
const findTargetProfileSummariesForTraining = function ({
  trainingId,
  targetProfileSummaryForAdminRepository = injectedTargetProfileSummaryForAdminRepository,
} = {}) {
  return targetProfileSummaryForAdminRepository.findByTraining({ trainingId });
};

export { findTargetProfileSummariesForTraining };
