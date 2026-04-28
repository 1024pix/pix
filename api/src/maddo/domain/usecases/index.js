import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as authenticationMethodRepository from '../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as campaignsAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as clientApplicationRepository from '../../infrastructure/repositories/client-application-repository.js';
import * as oidcProviderRepository from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  campaignsAPI,
  authenticationMethodRepository,
  clientApplicationRepository,
  organizationRepository,
  campaignRepository,
  oidcProviderRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
