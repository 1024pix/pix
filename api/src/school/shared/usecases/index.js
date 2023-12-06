import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as activityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../infrastructure/repositories/activity-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as schoolRepository from '../../infrastructure/repositories/school-repository.js';
import * as organizationLearnersRepository from '../../infrastructure/repositories/organization-learners-repository.js';
import * as missionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../infrastructure/repositories/mission-repository.js';

import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  activityAnswerRepository,
  activityRepository,
  assessmentRepository,
  missionAssessmentRepository,
  challengeRepository,
  schoolRepository,
  organizationLearnersRepository,
  missionRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../domain/usecases'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
