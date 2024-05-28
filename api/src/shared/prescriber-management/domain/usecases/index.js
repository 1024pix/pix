import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as membershipRepository from '../../../../shared/infrastructure/repositories/membership-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as prescriberRepository from '../../../../team/infrastructure/repositories/prescriber-repository.js';
import * as userOrgaSettingsRepository from '../../../../team/infrastructure/repositories/user-orga-settings-repository.js';

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
