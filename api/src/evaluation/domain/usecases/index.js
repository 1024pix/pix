import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as certificationEvaluationCandidateRepository from '../../../certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as llmApi from '../../../llm/application/api/llm-api.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { participationCompletedJobRepository } from '../../../prescription/campaign-participation/infrastructure/repositories/jobs/participation-completed-job-repository.js';
import * as targetProfileAdministrationRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import * as targetProfileRepository from '../../../prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import { fromDatasourceObject } from '../../../shared/infrastructure/adapters/solution-adapter.js';
import * as answerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeForCalculationRepository from '../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../../shared/infrastructure/repositories/course-repository.js';
import { repositories as injectedSharedRepositories } from '../../../shared/infrastructure/repositories/index.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { answerJobRepository } from '../../infrastructure/repositories/answer-job-repository.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import { certificationCompletedJobRepository } from '../../infrastructure/repositories/certification-completed-job-repository.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as feedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as stageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as algorithmDataFetcherService from '../services/algorithm-methods/data-fetcher.js';
import * as smartRandomService from '../services/algorithm-methods/smart-random.js';
import * as correctionService from '../services/correction-service.js';
import { getCompetenceLevel } from '../services/get-competence-level.js';
import * as getMasteryPercentageService from '../services/get-mastery-percentage-service.js';
import * as improvementService from '../services/improvement-service.js';
import { pickChallengeService } from '../services/pick-challenge-service.js';
import * as scorecardService from '../services/scorecard-service.js';
import * as convertLevelStagesIntoThresholdsService from '../services/stages/convert-level-stages-into-thresholds-service.js';
import * as getNewAcquiredStagesService from '../services/stages/get-new-acquired-stages-service.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  algorithmDataFetcherService,
  answerJobRepository,
  certificationCompletedJobRepository,
  fromDatasourceObject,
  answerRepository,
  correctionRepository: repositories.correctionRepository,
  areaRepository,
  assessmentRepository,
  autonomousCourseRepository: repositories.autonomousCourseRepository,
  autonomousCourseTargetProfileRepository: repositories.autonomousCourseTargetProfileRepository,
  badgeAcquisitionRepository,
  badgeCriteriaRepository,
  badgeForCalculationRepository,
  badgeRepository,
  campaignParticipationRepository,
  campaignRepository,
  certificationChallengeLiveAlertRepository,
  certificationEvaluationCandidateRepository,
  challengeRepository,
  competenceEvaluationRepository,
  competenceRepository,
  correctionService,
  courseRepository,
  feedbackRepository,
  getCompetenceLevel,
  improvementService,
  knowledgeElementRepository: injectedSharedRepositories.knowledgeElementRepository,
  llmApi,
  pickChallengeService,
  scorecardService,
  skillRepository,
  smartRandomService,
  stageAcquisitionRepository,
  stageCollectionForTargetProfileRepository,
  stageRepository,
  targetProfileAdministrationRepository,
  targetProfileRepository,
  userRepository: repositories.userRepository,
  getNewAcquiredStagesService,
  convertLevelStagesIntoThresholdsService,
  getMasteryPercentageService,
  participationCompletedJobRepository,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { evaluationUsecases };
