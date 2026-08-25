import * as complementaryCertificationBadgeRepository from '../../../evaluation/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as llmApi from '../../../llm/application/api/llm-api.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import knowledgeStateForParticipationService from '../../../prescription/shared/domain/services/knowledge-state-for-participation-service.js';
import * as targetProfileAdministrationRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import * as targetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import * as answerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeForCalculationRepository from '../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../../shared/infrastructure/repositories/course-repository.js';
import * as competenceScoreRepository from '../../../shared/infrastructure/repositories/competence-score-repository.js';
import * as knowledgeStateRepository from '../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as feedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as smartRandomService from '../services/algorithm-methods/smart-random.js';
import * as correctionService from '../services/correction-service.js';
import { getCompetenceLevel } from '../services/get-competence-level.js';
import * as improvementService from '../services/improvement-service.js';
import { services as evaluationServices } from '../services/index.js';
import { pickChallengeService } from '../services/pick-challenge-service.js';
import * as scorecardService from '../services/scorecard-service.js';
import { completeAssessment } from './complete-assessment.js';
import { copyTargetProfileBadges } from './copy-target-profile-badges.js';
import { createBadge } from './create-badge.js';
import { deleteUnassociatedBadge } from './delete-unassociated-badge.js';
import { findAllPaginatedAutonomousCourses } from './find-all-paginated-autonomous-courses.js';
import { findAnswerByAssessment } from './find-answer-by-assessment.js';
import { findAnswerByChallengeAndAssessment } from './find-answer-by-challenge-and-assessment.js';
import { findCompetenceEvaluationsByAssessment } from './find-competence-evaluations-by-assessment.js';
import { getAnswer } from './get-answer.js';
import { getAutonomousCourse } from './get-autonomous-course.js';
import { getAutonomousCourseTargetProfiles } from './get-autonomous-course-target-profiles.js';
import { getCampaignParametersForSimulator } from './get-campaign-parameters-for-simulator.js';
import { getCorrectionForAnswer } from './get-correction-for-answer.js';
import { getKnowledgeStateForUser } from './get-knowledge-state-for-user.js';
import { getNextChallengeForSimulator } from './get-next-challenge-for-simulator.js';
import { getProgression } from './get-progression.js';
import { getScorecard } from './get-scorecard.js';
import { handleBadgeAcquisition } from './handle-badge-acquisition.js';
import { improveCompetenceEvaluation } from './improve-competence-evaluation.js';
import { promptToLLMChat } from './prompt-to-llm-chat.js';
import { rememberUserHasSeenAssessmentInstructions } from './remember-user-has-seen-assessment-instructions.js';
import { rememberUserHasSeenNewDashboardInfo } from './remember-user-has-seen-new-dashboard-info.js';
import { resetScorecard } from './reset-scorecard.js';
import { saveAndCorrectAnswerForCampaign } from './save-and-correct-answer-for-campaign.js';
import { saveAndCorrectAnswerForCompetenceEvaluation } from './save-and-correct-answer-for-competence-evaluation.js';
import { saveAndCorrectAnswerForDemoAndPreview } from './save-and-correct-answer-for-demo-and-preview.js';
import { saveAutonomousCourse } from './save-autonomous-course.js';
import { saveFeedback } from './save-feedback.js';
import { startEmbedLlmChat } from './start-embed-llm-chat.js';
import { startOrResumeCompetenceEvaluation } from './start-or-resume-competence-evaluation.js';
import { updateAssessmentWithNextChallenge } from './update-assessment-with-next-challenge.js';
import { updateAutonomousCourse } from './update-autonomous-course.js';
import { updateBadge } from './update-badge.js';
import { updateBadgeCriterion } from './update-badge-criterion.js';
import { updateLastQuestionState } from './update-last-question-state.js';

const dependencies = {
  answerRepository,
  correctionRepository: repositories.correctionRepository,
  areaRepository,
  assessmentRepository,
  autonomousCourseRepository: repositories.autonomousCourseRepository,
  autonomousCourseTargetProfileRepository: repositories.autonomousCourseTargetProfileRepository,
  certificationEvaluationRepository: repositories.certificationEvaluationRepository,
  badgeAcquisitionRepository,
  badgeCriteriaRepository,
  badgeForCalculationRepository,
  badgeRepository,
  campaignParticipationRepository,
  campaignRepository,
  challengeRepository,
  competenceEvaluationRepository,
  competenceRepository,
  complementaryCertificationBadgeRepository,
  correctionService,
  courseRepository,
  feedbackRepository,
  getCampaignProgression: evaluationServices.getCampaignProgression,
  getCompetenceLevel,
  getNextChallengeForCampaignAssessment: evaluationServices.getNextChallengeForCampaignAssessment,
  getNextChallengeForCompetenceEvaluation: evaluationServices.getNextChallengeForCompetenceEvaluation,
  getNextChallengeForDemo: evaluationServices.getNextChallengeForDemo,
  improvementService,
  competenceScoreRepository,
  knowledgeStateRepository,
  llmApi,
  pickChallengeService,
  scorecardService,
  skillRepository,
  smartRandomService,
  targetProfileAdministrationRepository,
  targetProfileRepository,
  userRepository: repositories.userRepository,
  knowledgeStateForParticipationService,
  challengeToPlayRepository,
};

const usecasesWithoutInjectedDependencies = {
  completeAssessment,
  copyTargetProfileBadges,
  createBadge,
  deleteUnassociatedBadge,
  findAllPaginatedAutonomousCourses,
  findAnswerByAssessment,
  findAnswerByChallengeAndAssessment,
  findCompetenceEvaluationsByAssessment,
  getKnowledgeStateForUser,
  getAnswer,
  getAutonomousCourseTargetProfiles,
  getAutonomousCourse,
  getCampaignParametersForSimulator,
  getCorrectionForAnswer,
  getNextChallengeForSimulator,
  getProgression,
  getScorecard,
  handleBadgeAcquisition,
  improveCompetenceEvaluation,
  promptToLLMChat,
  rememberUserHasSeenAssessmentInstructions,
  rememberUserHasSeenNewDashboardInfo,
  resetScorecard,
  saveAndCorrectAnswerForCampaign,
  saveAndCorrectAnswerForCompetenceEvaluation,
  saveAndCorrectAnswerForDemoAndPreview,
  saveAutonomousCourse,
  saveFeedback,
  startEmbedLlmChat,
  startOrResumeCompetenceEvaluation,
  updateAssessmentWithNextChallenge,
  updateAutonomousCourse,
  updateBadgeCriterion,
  updateBadge,
  updateLastQuestionState,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { evaluationUsecases };
