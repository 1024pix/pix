import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../../lib/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as stageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as feedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
import * as targetProfileRepository from '../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as targetProfileForAdminRepository from '../../../shared/infrastructure/repositories/target-profile-for-admin-repository.js';
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
  campaignRepository,
  campaignParticipationRepository,
  autonomousCourseRepository: repositories.autonomousCourseRepository,
  competenceEvaluationRepository,
  competenceRepository,
  knowledgeElementRepository,
  stageCollectionForTargetProfileRepository,
  stageAcquisitionRepository,
  feedbackRepository,
  stageRepository,
  targetProfileForAdminRepository,
  targetProfileRepository,
  getCompetenceLevel,
  scorecardService,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { evaluationUsecases };
