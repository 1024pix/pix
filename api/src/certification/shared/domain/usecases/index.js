import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as certificationCandidateRepository from '../../../candidate/infrastructure/repositories/certification-candidate-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as supervisorAccessRepository from '../../../session/infrastructure/repositories/supervisor-access-repository.js';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';

const dependencies = {
  sessionRepository,
  supervisorAccessRepository,
  certificationCandidateRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../session/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../candidate/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
