import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as prescriberRepository from '../../infrastructure/repositories/prescriber-repository.js';
import * as membershipRepository from '../../../../shared/infrastructure/repositories/membership-repository.js';
import * as userOrgaSettingsRepository from '../../infrastructure/repositories/user-orga-settings-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
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
