import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as llmApi from '../../../llm/application/api/llm-api.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as targetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import { updateCombinedCourseJobRepository } from '../../../quest/infrastructure/repositories/jobs/update-combined-course-job-repository.js';
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as moduleIssueReportRepository from '../../infrastructure/repositories/module-issue-report-repository.js';
import * as targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';
import { addTutorialEvaluation } from './add-tutorial-evaluation.js';
import { addTutorialToUser } from './add-tutorial-to-user.js';
import { attachTargetProfilesToTraining } from './attach-target-profiles-to-training.js';
import { createModuleIssueReport } from './create-module-issue-report.js';
import { createOrUpdateTrainingTrigger } from './create-or-update-training-trigger.js';
import { createPassage } from './create-passage.js';
import { createTraining } from './create-training.js';
import { deleteTrainingTrigger } from './delete-training-trigger.js';
import { detachTargetProfilesFromTraining } from './detach-target-profiles-from-training.js';
import { duplicateTraining } from './duplicate-training.js';
import { findCampaignParticipationTrainings } from './find-campaign-participation-trainings.js';
import { findPaginatedFilteredTutorials } from './find-paginated-filtered-tutorials.js';
import { findPaginatedTargetProfileTrainingSummaries } from './find-paginated-target-profile-training-summaries.js';
import { findPaginatedTrainingSummaries } from './find-paginated-training-summaries.js';
import { findPaginatedUserRecommendedTrainings } from './find-paginated-user-recommended-trainings.js';
import { findRecommendableModulesByTargetProfileIds } from './find-recommendable-modules-by-target-profile-ids.js';
import { findRecommendedModulesByCampaignParticipationIds } from './find-recommended-modules-by-campaign-participation-ids.js';
import { findTargetProfileSummariesForTraining } from './find-target-profile-summaries-for-training.js';
import { findTutorials } from './find-tutorials.js';
import { getModuleByShortId } from './get-module-by-short-id.js';
import { getModuleJsonSchema } from './get-module-json-schema.js';
import { getModuleMetadataList } from './get-module-metadata-list.js';
import { getModuleMetadataListByIds } from './get-module-metadata-list-by-ids.js';
import { getModuleMetadataListByShortIds } from './get-module-metadata-list-by-short-ids.js';
import { getTraining } from './get-training.js';
import { getUserModuleStatuses } from './get-user-module-statuses.js';
import { handleTrainingRecommendation } from './handle-training-recommendation.js';
import { promptToLLMChat } from './prompt-to-llm-chat.js';
import { recordPassageEvents } from './record-passage-events.js';
import { saveUserRelevanceFeedbackOnRecommendedTraining } from './save-user-relevance-feedback-on-recommended-training.js';
import { startEmbedLlmChat } from './start-embed-llm-chat.js';
import { terminatePassage } from './terminate-passage.js';
import { updateTraining } from './update-training.js';
import { verifyAndSaveAnswer } from './verify-and-save-answer.js';

const dependencies = {
  ...repositories,
  campaignRepository,
  campaignParticipationRepository,
  knowledgeElementRepository,
  moduleIssueReportRepository,
  targetProfileRepository,
  targetProfileSummaryForAdminRepository,
  tubeRepository,
  targetProfileTrainingRepository,
  updateCombinedCourseJobRepository,
  skillRepository,
  userRepository,
  llmApi,
  logger,
};

const usecasesWithoutInjectedDependencies = {
  addTutorialEvaluation,
  addTutorialToUser,
  attachTargetProfilesToTraining,
  createOrUpdateTrainingTrigger,
  createModuleIssueReport,
  createPassage,
  deleteTrainingTrigger,
  createTraining,
  detachTargetProfilesFromTraining,
  duplicateTraining,
  findCampaignParticipationTrainings,
  findPaginatedFilteredTutorials,
  findPaginatedTargetProfileTrainingSummaries,
  findPaginatedTrainingSummaries,
  findPaginatedUserRecommendedTrainings,
  findRecommendedModulesByCampaignParticipationIds,
  findRecommendableModulesByTargetProfileIds,
  findTargetProfileSummariesForTraining,
  findTutorials,
  getModuleMetadataList,
  getModuleMetadataListByIds,
  getModuleMetadataListByShortIds,
  getModuleByShortId,
  getModuleJsonSchema,
  getTraining,
  getUserModuleStatuses,
  handleTrainingRecommendation,
  promptToLLMChat,
  recordPassageEvents,
  saveUserRelevanceFeedbackOnRecommendedTraining,
  startEmbedLlmChat,
  terminatePassage,
  updateTraining,
  verifyAndSaveAnswer,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
