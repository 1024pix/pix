import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as scoringCertificationService from '../../../../certification/shared/domain/services/scoring-certification-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as verifyCertificateCodeService from '../../../evaluation/domain/services/verify-certificate-code-service.js';
import * as certifiableProfileForLearningContentRepository from '../../../evaluation/infrastructure/repositories/certifiable-profile-for-learning-content-repository.js';
import {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationChallengeRepository as sessionManagementCertificationChallengeRepository,
  challengeRepository as sharedChallengeRepository,
  competenceMarkRepository,
  cpfExportRepository,
  flashAlgorithmConfigurationRepository,
  sessionRepositories,
  sharedCompetenceMarkRepository,
} from '../../../session-management/infrastructure/repositories/index.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as sharedCertificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as sharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';
import * as challengeCalibrationRepository from '../../infrastructure/repositories/challenge-calibration-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as evaluationSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as flashAlgorithmService from '../services/algorithm-methods/flash.js';
import * as certificationChallengesService from '../services/certification-challenges-service.js';
import { services } from '../services/index.js';
import pickChallengeService from '../services/pick-challenge-service.js';

/**
 * @typedef {certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {evaluationSessionRepository} EvaluationSessionRepository
 * @typedef {certificationChallengeRepository} CertificationChallengeRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certifiableProfileForLearningContentRepository} CertifiableProfileForLearningContentRepository
 * @typedef {complementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {scoringCertificationService} ScoringCertificationService
 * @typedef {sharedFlashAlgorithmConfigurationRepository} SharedFlashAlgorithmConfigurationRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {services} Services
 */
const dependencies = {
  ...sessionRepositories,
  evaluationSessionRepository,
  sessionManagementCertificationChallengeRepository,
  challengeCalibrationRepository,
  certificationCandidateRepository,
  certifiableProfileForLearningContentRepository,
  assessmentRepository,
  sharedCertificationCandidateRepository,
  verifyCertificateCodeService,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  sharedChallengeRepository,
  userRepository,
  competenceMarkRepository,
  certificationChallengesService,
  cpfExportRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  certificationBadgesService,
  pickChallengeService,
  placementProfileService,
  certificationCenterRepository,
  certificationCompanionAlertRepository,
  certificationCourseRepository,
  certificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository,
  scoringCertificationService,
  sharedFlashAlgorithmConfigurationRepository,
  services,
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
