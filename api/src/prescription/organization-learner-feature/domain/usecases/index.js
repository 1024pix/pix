import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as featureRepository from '../../../../shared/infrastructure/repositories/feature-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationLearnerFeatureRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';

const dependencies = {
  organizationRepository,
  organizationLearnerRepository,
  organizationLearnerFeatureRepository,
  featureRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
