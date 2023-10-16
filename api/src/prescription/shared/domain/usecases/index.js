import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as supOrganizationLearnerRepository from '../../../learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as campaignParticipationRepository from '../../../learner-management/infrastructure/repositories/campaign-participation-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  supOrganizationLearnerRepository,
  organizationLearnerRepository,
  campaignParticipationRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../learner-management/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
