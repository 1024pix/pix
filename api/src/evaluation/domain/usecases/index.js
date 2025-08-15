import { completeAssessment } from './complete-assessment.js';
import { copyTargetProfileBadges } from './copy-target-profile-badges.js';
import { copyTargetProfileStages } from './copy-target-profile-stages.js';
import { createBadge } from './create-badge.js';
import { createOrUpdateStageCollection } from './create-or-update-stage-collection.js';
import { findAllPaginatedAutonomousCourses } from './find-all-paginated-autonomous-courses.js';
import { findAnswerByAssessment } from './find-answer-by-assessment.js';
import { findAnswerByChallengeAndAssessment } from './find-answer-by-challenge-and-assessment.js';
import { findCompetenceEvaluationsByAssessment } from './find-competence-evaluations-by-assessment.js';
import { findFilteredMostRecentKnowledgeElementsByUser } from './find-filtered-most-recent-knowledge-elements-by-user.js';
import { getAnswer } from './get-answer.js';
import { getAutonomousCourse } from './get-autonomous-course.js';
import { getAutonomousCourseTargetProfiles } from './get-autonomous-course-target-profiles.js';
import { getCampaignParametersForSimulator } from './get-campaign-parameters-for-simulator.js';
import { getCorrectionForAnswer } from './get-correction-for-answer.js';
import { getNextChallengeForCampaignAssessment } from './get-next-challenge-for-campaign-assessment.js';
import { getNextChallengeForCompetenceEvaluation } from './get-next-challenge-for-competence-evaluation.js';
import { getNextChallengeForDemo } from './get-next-challenge-for-demo.js';
import { getNextChallengeForPreview } from './get-next-challenge-for-preview.js';
import { getNextChallengeForSimulator } from './get-next-challenge-for-simulator.js';
import { getProgression } from './get-progression.js';
import { getScorecard } from './get-scorecard.js';
import { handleBadgeAcquisition } from './handle-badge-acquisition.js';
import { handleStageAcquisition } from './handle-stage-acquisition.js';
import { improveCompetenceEvaluation } from './improve-competence-evaluation.js';
import { promptToLLMChat } from './prompt-to-llm-chat.js';
import { rememberUserHasSeenAssessmentInstructions } from './remember-user-has-seen-assessment-instructions.js';
import { rememberUserHasSeenNewDashboardInfo } from './remember-user-has-seen-new-dashboard-info.js';
import { resetScorecard } from './reset-scorecard.js';
import { saveAndCorrectAnswerForCampaign } from './save-and-correct-answer-for-campaign.js';
import { saveAndCorrectAnswerForCertification } from './save-and-correct-answer-for-certification.js';
import { saveAndCorrectAnswerForCompetenceEvaluation } from './save-and-correct-answer-for-competence-evaluation.js';
import { saveAndCorrectAnswerForDemoAndPreview } from './save-and-correct-answer-for-demo-and-preview.js';
import { saveAutonomousCourse } from './save-autonomous-course.js';
import { saveFeedback } from './save-feedback.js';
import { startEmbedLlmChat } from './start-embed-llm-chat.js';
import { startOrResumeCompetenceEvaluation } from './start-or-resume-competence-evaluation.js';
import { updateAutonomousCourse } from './update-autonomous-course.js';
import { updateBadge } from './update-badge.js';
import { updateBadgeCriterion } from './update-badge-criterion.js';
import { isStageNotUpdatable, updateStage } from './update-stage.js';

const usecases = {
  completeAssessment,
  copyTargetProfileBadges,
  copyTargetProfileStages,
  createBadge,
  createOrUpdateStageCollection,
  findAllPaginatedAutonomousCourses,
  findAnswerByAssessment,
  findAnswerByChallengeAndAssessment,
  findCompetenceEvaluationsByAssessment,
  findFilteredMostRecentKnowledgeElementsByUser,
  getAnswer,
  getAutonomousCourseTargetProfiles,
  getAutonomousCourse,
  getCampaignParametersForSimulator,
  getCorrectionForAnswer,
  getNextChallengeForCampaignAssessment,
  getNextChallengeForCompetenceEvaluation,
  getNextChallengeForDemo,
  getNextChallengeForPreview,
  getNextChallengeForSimulator,
  getProgression,
  getScorecard,
  handleBadgeAcquisition,
  handleStageAcquisition,
  improveCompetenceEvaluation,
  promptToLLMChat,
  rememberUserHasSeenAssessmentInstructions,
  rememberUserHasSeenNewDashboardInfo,
  resetScorecard,
  saveAndCorrectAnswerForCampaign,
  saveAndCorrectAnswerForCertification,
  saveAndCorrectAnswerForCompetenceEvaluation,
  saveAndCorrectAnswerForDemoAndPreview,
  saveAutonomousCourse,
  saveFeedback,
  startEmbedLlmChat,
  startOrResumeCompetenceEvaluation,
  updateAutonomousCourse,
  updateBadgeCriterion,
  updateBadge,
  isStageNotUpdatable,
  updateStage,
};

const evaluationUsecases = usecases;

export { evaluationUsecases };
