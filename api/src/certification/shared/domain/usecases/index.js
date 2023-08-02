import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as sessionCodeService from '../../../../../lib/domain/services/session-code-service.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';

import { importNamedExportsFromDirectory } from '../../../../../lib/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../../lib/infrastructure/utils/dependency-injection.js';

const dependencies = {
  certificationCenterRepository,
  sessionCodeService,
  sessionRepository,
  sessionValidator,
  userRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../session/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
