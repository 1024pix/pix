import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as profileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
import * as questRepository from '../../infrastructure/repositories/quest-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  eligibilityRepository: repositories.eligibilityRepository,
  profileRewardRepository,
  questRepository,
  successRepository: repositories.successRepository,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
