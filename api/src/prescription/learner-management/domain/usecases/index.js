import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as userReconciliationService from '../../../../../lib/domain/services/user-reconciliation-service.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as organizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { importStorage } from '../../infrastructure/storage/import-storage.js';

const dependencies = {
  campaignRepository,
  campaignParticipationRepository,
  importStorage,
  membershipRepository,
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
  organizationRepository,
  organizationImportRepository,
  supOrganizationLearnerRepository,
  organizationFeatureApi,
  userReconciliationService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, './import-from-feature/'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
