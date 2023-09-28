import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  answerRepository,
  assessmentRepository,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { evaluationUsecases };
