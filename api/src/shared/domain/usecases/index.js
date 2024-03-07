import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as activityAnswerRepository from '../../../school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../school/infrastructure/repositories/activity-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  activityAnswerRepository,
  activityRepository,
  assessmentRepository,
  challengeRepository,
  badgeRepository,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { sharedUsecases };
