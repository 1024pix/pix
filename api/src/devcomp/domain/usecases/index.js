import { addTutorialEvaluation } from './add-tutorial-evaluation.js';
import { addTutorialToUser } from './add-tutorial-to-user.js';
import { attachTargetProfilesToTraining } from './attach-target-profiles-to-training.js';
import { createOrUpdateTrainingTrigger } from './create-or-update-training-trigger.js';
import { createPassage } from './create-passage.js';
import { createTraining } from './create-training.js';
import { detachTargetProfilesFromTraining } from './detach-target-profiles-from-training.js';
import { duplicateTraining } from './duplicate-training.js';
import { findCampaignParticipationTrainings } from './find-campaign-participation-trainings.js';
import { findPaginatedFilteredTutorials } from './find-paginated-filtered-tutorials.js';
import { findPaginatedTargetProfileTrainingSummaries } from './find-paginated-target-profile-training-summaries.js';
import { findPaginatedTrainingSummaries } from './find-paginated-training-summaries.js';
import { findPaginatedUserRecommendedTrainings } from './find-paginated-user-recommended-trainings.js';
import { findRecommendedModulesByCampaignParticipationIds } from './find-recommended-modules-by-campaign-participation-ids.js';
import { findRecommendedModulesByTargetProfileIds } from './find-recommended-modules-by-target-profile-ids.js';
import { findTargetProfileSummariesForTraining } from './find-target-profile-summaries-for-training.js';
import { findTutorials } from './find-tutorials.js';
import { getModule } from './get-module.js';
import { getModuleMetadataList } from './get-module-metadata-list.js';
import { getTraining } from './get-training.js';
import { getUserModuleStatuses } from './get-user-module-statuses.js';
import { handleTrainingRecommendation } from './handle-training-recommendation.js';
import { promptToLLMChat } from './prompt-to-llm-chat.js';
import { recordPassageEvents } from './record-passage-events.js';
import { startEmbedLlmChat } from './start-embed-llm-chat.js';
import { terminatePassage } from './terminate-passage.js';
import { updateTraining } from './update-training.js';
import { verifyAndSaveAnswer } from './verify-and-save-answer.js';

const usecases = {
  addTutorialEvaluation,
  addTutorialToUser,
  attachTargetProfilesToTraining,
  createOrUpdateTrainingTrigger,
  createPassage,
  createTraining,
  detachTargetProfilesFromTraining,
  duplicateTraining,
  findCampaignParticipationTrainings,
  findPaginatedFilteredTutorials,
  findPaginatedTargetProfileTrainingSummaries,
  findPaginatedTrainingSummaries,
  findPaginatedUserRecommendedTrainings,
  findRecommendedModulesByCampaignParticipationIds,
  findRecommendedModulesByTargetProfileIds,
  findTargetProfileSummariesForTraining,
  findTutorials,
  getModuleMetadataList,
  getModule,
  getTraining,
  getUserModuleStatuses,
  handleTrainingRecommendation,
  promptToLLMChat,
  recordPassageEvents,
  startEmbedLlmChat,
  terminatePassage,
  updateTraining,
  verifyAndSaveAnswer,
};

export { usecases };
