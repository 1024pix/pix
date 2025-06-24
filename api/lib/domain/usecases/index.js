import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { OidcAuthenticationServiceRegistry } from '../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import * as oidcProviderRepository from '../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import * as userRepository from '../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import * as campaignRepository from '../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as studentRepository from '../../../src/prescription/learner-management/infrastructure/repositories/student-repository.js';
import * as obfuscationService from '../../../src/shared/domain/services/obfuscation-service.js';
import * as userReconciliationService from '../../../src/shared/domain/services/user-reconciliation-service.js';
import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as organizationLearnerRepository from '../../../src/shared/infrastructure/repositories/organization-learner-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../src/shared/infrastructure/repositories/tube-repository.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as learningContentConversionService from '../services/learning-content/learning-content-conversion-service.js';

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });

const dependencies = {
  areaRepository,
  campaignRepository,
  competenceRepository,
  learningContentConversionService,
  obfuscationService,
  organizationLearnerRepository,
  skillRepository,
  studentRepository,
  thematicRepository,
  tubeRepository,
  userReconciliationService,
  userRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { oidcAuthenticationServiceRegistry, usecases };
