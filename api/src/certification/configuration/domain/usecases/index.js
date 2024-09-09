import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as complementaryCertificationRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as centerPilotFeaturesRepository from '../../infrastructure/repositories/center-pilot-features-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';
/**
 * @typedef {import('../../infrastructure/repositories/index.js').SessionsRepository} SessionsRepository
 */
import { configurationRepositories } from '../../infrastructure/repositories/index.js';
import { convertCenterToV3JobRepository } from '../../infrastructure/repositories/jobs/convert-center-to-v3-job-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {attachableTargetProfileRepository} AttachableTargetProfileRepository
 * @typedef {centerPilotFeaturesRepository} CenterPilotFeaturesRepository
 * @typedef {centerRepository} CentersRepository
 * @typedef {convertCenterToV3JobRepository} ConvertCenterToV3JobRepository
 * @typedef {sessionsRepository} SessionsRepository
 **/
const dependencies = {
  attachableTargetProfileRepository,
  complementaryCertificationRepository,
  centerPilotFeaturesRepository,
  centerRepository,
  convertCenterToV3JobRepository,
  sessionsRepository: configurationRepositories.sessionsRepository,
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
