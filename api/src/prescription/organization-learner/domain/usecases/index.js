import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  supOrganizationParticipantRepository,
  scoOrganizationParticipantRepository,
  organizationParticipantRepository,
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
