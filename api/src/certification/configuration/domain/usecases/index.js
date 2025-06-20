import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as complementaryCertificationRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as activeCalibratedChallengeRepository from '../../infrastructure/repositories/active-calibrated-challenge-repository.js';
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as centerPilotFeaturesRepository from '../../infrastructure/repositories/center-pilot-features-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';
import * as certificationFrameworksChallengeRepository from '../../infrastructure/repositories/certification-frameworks-challenge-repository.js';
import * as consolidatedFrameworkRepository from '../../infrastructure/repositories/consolidated-framework-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {activeCalibratedChallengeRepository} ActiveCalibratedChallengeRepository
 * @typedef {attachableTargetProfileRepository} AttachableTargetProfileRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerPilotFeaturesRepository} CenterPilotFeaturesRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {consolidatedFrameworkRepository} ConsolidatedFrameworkRepository
 * @typedef {certificationFrameworksChallengeRepository} CertificationFrameworksChallengeRepository
 * @typedef {skillRepository} SkillRepository
 * @typedef {tubeRepository} TubeRepository
 **/
const dependencies = {
  activeCalibratedChallengeRepository,
  attachableTargetProfileRepository,
  candidateRepository,
  centerPilotFeaturesRepository,
  centerRepository,
  challengeRepository,
  complementaryCertificationRepository,
  consolidatedFrameworkRepository,
  certificationFrameworksChallengeRepository,
  skillRepository,
  tubeRepository,
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
