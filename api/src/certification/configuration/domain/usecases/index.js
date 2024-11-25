import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as complementaryCertificationRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as centerPilotFeaturesRepository from '../../infrastructure/repositories/center-pilot-features-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {attachableTargetProfileRepository} AttachableTargetProfileRepository
 * @typedef {centerPilotFeaturesRepository} CenterPilotFeaturesRepository
 * @typedef {centerRepository} CentersRepository
 * @typedef {candidateRepository} CandidateRepository
 **/
const dependencies = {
  attachableTargetProfileRepository,
  complementaryCertificationRepository,
  centerPilotFeaturesRepository,
  centerRepository,
  candidateRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: 'index.js',
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
