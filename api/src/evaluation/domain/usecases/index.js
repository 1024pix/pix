import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as smartRandomService from '../../../../lib/domain/services/algorithm-methods/smart-random.js';
import * as improvementService from '../../../../lib/domain/services/improvement-service.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { pickChallengeService } from '../../../certification/flash-certification/domain/services/pick-challenge-service.js';
import * as answerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as targetProfileForAdminRepository from '../../../shared/infrastructure/repositories/target-profile-for-admin-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as feedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as stageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../infrastructure/repositories/stage-repository.js';
import { getCompetenceLevel } from '../services/get-competence-level.js';
import * as scorecardService from '../services/scorecard-service.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  answerRepository,
  areaRepository,
  assessmentRepository,
  autonomousCourseRepository: repositories.autonomousCourseRepository,
  autonomousCourseTargetProfileRepository: repositories.autonomousCourseTargetProfileRepository,
  campaignRepository,
  campaignParticipationRepository,
  competenceEvaluationRepository,
  competenceRepository,
  feedbackRepository,
  knowledgeElementRepository,
  skillRepository,
  stageCollectionForTargetProfileRepository,
  stageAcquisitionRepository,
  stageRepository,
  targetProfileForAdminRepository,
  targetProfileRepository,
  getCompetenceLevel,
  smartRandomService,
  improvementService,
  pickChallengeService,
  scorecardService,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { evaluationUsecases };
