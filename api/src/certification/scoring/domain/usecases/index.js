// eslint-disable import/no-restricted-paths
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

import * as competenceForScoringRepository from '../../infrastructure/repositories/competence-for-scoring-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 * @typedef {competenceForScoringRepository} CompetenceForScoringRepository
 **/
const dependencies = { competenceForScoringRepository };

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
