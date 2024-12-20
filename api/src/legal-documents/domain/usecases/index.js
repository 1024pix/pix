import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import * as legalDocumentRepository from '../../infrastructure/repositories/legal-document.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import * as userAcceptanceRepository from '../../infrastructure/repositories/user-acceptance.repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const repositories = {
  legalDocumentRepository,
  userAcceptanceRepository,
  userRepository,
};

const dependencies = Object.assign({ logger }, repositories);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
