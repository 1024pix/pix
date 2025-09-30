import * as certificationChallengeLiveAlertRepository from '../../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as sharedChallengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as verifyCertificateCodeService from '../../../evaluation/domain/services/verify-certificate-code-service.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as sharedCertificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as sessionManagementCertificationChallengeRepository from '../../../shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as sharedCompetenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as sharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';
import * as challengeCalibrationRepository from '../../infrastructure/repositories/challenge-calibration-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as evaluationSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as flashAlgorithmService from '../services/algorithm-methods/flash.js';
import { services } from '../services/index.js';
import pickChallengeService from '../services/pick-challenge-service.js';

/**
 * @typedef {certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {evaluationSessionRepository} EvaluationSessionRepository
 * @typedef {certificationChallengeRepository} CertificationChallengeRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {complementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {sharedFlashAlgorithmConfigurationRepository} SharedFlashAlgorithmConfigurationRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {services} Services
 */
const dependencies = {
  evaluationSessionRepository,
  sessionManagementCertificationChallengeRepository,
  challengeCalibrationRepository,
  certificationCandidateRepository,
  assessmentRepository,
  sharedCertificationCandidateRepository,
  verifyCertificateCodeService,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  sharedChallengeRepository,
  userRepository,
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
  sharedFlashAlgorithmConfigurationRepository,
  certificationChallengeLiveAlertRepository,
  services,
};

import { createCompanionAlert } from './create-companion-alert.js';
import { deneutralizeChallenge } from './deneutralize-challenge.js';
import { getNextChallenge } from './get-next-challenge.js';
import { neutralizeChallenge } from './neutralize-challenge.js';
import { rescoreV2Certification } from './rescore-v2-certification.js';
import { rescoreV3Certification } from './rescore-v3-certification.js';
import { retrieveLastOrCreateCertificationCourse } from './retrieve-last-or-create-certification-course.js';
import { scoreCompletedCertification } from './score-completed-certification.js';
import { simulateFlashAssessmentScenario } from './simulate-flash-assessment-scenario.js';

const usecasesWithoutInjectedDependencies = {
  createCompanionAlert,
  deneutralizeChallenge,
  getNextChallenge,
  neutralizeChallenge,
  rescoreV2Certification,
  rescoreV3Certification,
  retrieveLastOrCreateCertificationCourse,
  scoreCompletedCertification,
  simulateFlashAssessmentScenario,
};
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
