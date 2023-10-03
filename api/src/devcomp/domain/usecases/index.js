import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { repositories } from '../../infrastructure/repositories/index.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  ...repositories,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
