// eslint-disable import/no-restricted-paths
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as sharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as flashAlgorithmService from '../services/algorithm-methods/flash.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {flashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {sharedFlashAlgorithmConfigurationRepository} SharedFlashAlgorithmConfigurationRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 */
const dependencies = {
  challengeRepository,
  flashAlgorithmConfigurationRepository,
  sharedFlashAlgorithmConfigurationRepository,
  flashAlgorithmService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path,
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
