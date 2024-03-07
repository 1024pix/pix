import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../../lib/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationPlacesCapacityRepository from '../../infrastructure/repositories/organization-places-capacity-repository.js';
import * as organizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot-repository.js';

const dependencies = {
  organizationLearnerRepository,
  organizationPlacesLotRepository,
  organizationRepository,
  organizationPlacesCapacityRepository,
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
