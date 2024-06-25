import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as activityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../infrastructure/repositories/activity-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as missionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../infrastructure/repositories/mission-repository.js';

const dependencies = {
  activityAnswerRepository,
  activityRepository,
  areaRepository,
  assessmentRepository,
  competenceRepository,
  missionAssessmentRepository,
  missionRepository,
  missionLearnerRepository: repositories.missionLearnerRepository,
  organizationLearnerRepository: repositories.organizationLearnerRepository,
  schoolRepository: repositories.schoolRepository,
  challengeRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
