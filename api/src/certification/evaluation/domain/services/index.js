import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// TODO: cross-bounded context violation
import * as flashAlgorithmService from '../../../../certification/flash-certification/domain/services/algorithm-methods/flash.js';
// TODO: cross-bounded context violation
import * as scoringDegradationService from '../../../../certification/scoring/domain/services/scoring-degradation-service.js';
import * as scoringCertificationService from '../../../../certification/shared/domain/services/scoring-certification-service.js';
// TODO: cross-bounded context violation
import * as scoringService from '../../../../evaluation/domain/services/scoring/scoring-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as competenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as scoringConfigurationRepository from '../../../shared/infrastructure/repositories/scoring-configuration-repository.js';
import * as certificationAssessmentHistoryRepository from '../../infrastructure/repositories/certification-assessment-history-repository.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
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
 * @typedef {scoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {flashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {answerRepository} AnswerRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {scoringService} ScoringService
 * @typedef {areaRepository} AreaRepository
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {scoringCertificationService} ScoringCertificationService
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 */
const dependencies = {
  assessmentResultRepository,
  competenceMarkRepository,
  certificationCourseRepository,
  scoringDegradationService,
  flashAlgorithmConfigurationRepository,
  scoringConfigurationRepository,
  answerRepository,
  certificationAssessmentHistoryRepository,
  flashAlgorithmService,
  certificationChallengeForScoringRepository,
  challengeRepository,
  areaRepository,
  placementProfileService,
  scoringService,
  scoringCertificationService,
  certificationCandidateRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

/**
 * Note : current ignoredFileNames are injected in * {@link file://./../../../shared/domain/usecases/index.js}
 * This is in progress, because they should be injected in this file and not by shared sub-domain
 * The only remaining file ignored should be index.js
 */
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './scoring/'),
    ignoredFileNames: ['index.js'],
  })),
};

const services = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { services };
