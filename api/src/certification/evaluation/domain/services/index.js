import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// TODO: cross-bounded context violation
import * as flashAlgorithmService from '../../../../certification/flash-certification/domain/services/algorithm-methods/flash.js';
import * as scoringDegradationService from '../../../../certification/shared/domain/services/scoring-certification-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
// TODO: cross-bounded context violation
import {
  answerRepository,
  assessmentResultRepository,
  challengeRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
} from '../../../session-management/infrastructure/repositories/index.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationAssessmentHistoryRepository from '../../infrastructure/repositories/certification-assessment-history-repository.js';
import * as certificationChallengeForScoringRepository from '../../infrastructure/repositories/certification-challenge-for-scoring-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {scoringDegradationService} ScoringDegradationService
 * @typedef {certificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 * @typedef {certificationChallengeForScoringRepository} CertificationChallengeForScoringRepository
 */
const dependencies = {
  assessmentResultRepository,
  competenceMarkRepository,
  certificationCourseRepository,
  scoringDegradationService,

  answerRepository,
  certificationAssessmentHistoryRepository,
  certificationChallengeForScoringRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringConfigurationRepository,
  challengeRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

/**
 * Note : current ignoredFileNames are injected in * {@link file://./../../../shared/domain/usecases/index.js}
 * This is in progress, because they should be injected in this file and not by shared sub-domain
 * The only remaining file ignored should be index.js
 */
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
