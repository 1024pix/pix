import * as scoringService from '../../../../evaluation/domain/services/scoring/scoring-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as competenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../shared/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as calibratedChallengeRepository from '../../infrastructure/repositories/calibrated-challenge-repository.js';
import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as certificationAssessmentHistoryRepository from '../../infrastructure/repositories/certification-assessment-history-repository.js';
import * as challengeCalibrationRepository from '../../infrastructure/repositories/challenge-calibration-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as scoringConfigurationRepository from '../../infrastructure/repositories/scoring-configuration-repository.js';
import * as flashAlgorithmService from './algorithm-methods/flash.js';
import { findCalibratedChallenges } from './scoring/calibrated-challenge-service.js';
import { scoreComplementaryCertificationV2 } from './scoring/score-complementary-certification-v2.js';
import * as scoringDegradationService from './scoring/scoring-degradation-service.js';
import { calculateCertificationAssessmentScore, handleV2CertificationScoring } from './scoring/scoring-v2.js';
import { handleV3CertificationScoring } from './scoring/scoring-v3.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {scoringDegradationService} ScoringDegradationService
 * @typedef {certificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 * @typedef {challengeCalibrationRepository} ChallengeCalibrationRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {scoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {answerRepository} AnswerRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {scoringService} ScoringService
 * @typedef {areaRepository} AreaRepository
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {complementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {complementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {sharedVersionRepository} SharedVersionRepository
 * @typedef {calibratedChallengeRepository} CalibratedChallengeRepository
 */
const dependencies = {
  assessmentResultRepository,
  competenceMarkRepository,
  certificationCourseRepository,
  scoringDegradationService,
  scoringConfigurationRepository,
  answerRepository,
  certificationAssessmentHistoryRepository,
  certificationChallengeLiveAlertRepository,
  flashAlgorithmService,
  challengeCalibrationRepository,
  areaRepository,
  placementProfileService,
  scoringService,
  candidateRepository,
  complementaryCertificationBadgesRepository,
  certificationAssessmentRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationScoringCriteriaRepository,
  calibratedChallengeRepository,
};

const servicesWithoutInjectedDependencies = {
  findCalibratedChallenges,
  scoreComplementaryCertificationV2,
  calculateCertificationAssessmentScore,
  handleV2CertificationScoring,
  handleV3CertificationScoring,
};

const injectedServices = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

export const services = {
  ...injectedServices,
  flashAlgorithmService,
};
