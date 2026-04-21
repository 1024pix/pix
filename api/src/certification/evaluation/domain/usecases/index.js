import * as certificationChallengeLiveAlertRepository from '../../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as correctionApi from '../../../../evaluation/application/api/correction-api.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as sharedChallengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import * as verifyCertificateCodeService from '../../../evaluation/domain/services/verify-certificate-code-service.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as sessionManagementCertificationChallengeRepository from '../../../shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as sharedCompetenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as assessmentSheetRepository from '../../infrastructure/repositories/assessment-sheet-repository.js';
import * as calibratedChallengeRepository from '../../infrastructure/repositories/calibrated-challenge-repository.js';
import * as certificationAssessmentHistoryRepository from '../../infrastructure/repositories/certification-assessment-history-repository.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';
import * as challengeCalibrationRepository from '../../infrastructure/repositories/challenge-calibration-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { certificationCompletedJobRepository } from '../../infrastructure/repositories/jobs/certification-completed-job-repository.js';
import * as pixPlusCertificationCourseRepository from '../../infrastructure/repositories/pix-plus-certification-course-repository.js';
import * as scoringConfigurationRepository from '../../infrastructure/repositories/scoring-configuration-repository.js';
import * as evaluationSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as flashAlgorithmService from '../services/algorithm-methods/flash.js';
import { services } from '../services/index.js';
import pickChallengeService from '../services/pick-challenge-service.js';
import { completeCertificationAssessment } from './complete-certification-assessment.js';
import { createCompanionAlert } from './create-companion-alert.js';
import { createLiveAlert } from './create-live-alert.js';
import { deneutralizeChallenge } from './deneutralize-challenge.js';
import { evaluateAndSaveAnswer } from './evaluate-and-save-answer.js';
import { getCertificationCourse } from './get-certification-course.js';
import { getNextChallenge } from './get-next-challenge.js';
import { neutralizeChallenge } from './neutralize-challenge.js';
import { rescoreV2Certification } from './rescore-v2-certification.js';
import { retrieveLastOrCreateCertificationCourse } from './retrieve-last-or-create-certification-course.js';
import { scoreV3Certification } from './score-v3-certification.js';
import { simulateCapacityFromScore } from './simulate-capacity-from-score.js';
import { simulateFlashAssessmentScenario } from './simulate-flash-assessment-scenario.js';
import { simulateScoreFromCapacity } from './simulate-score-from-capacity.js';

/**
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {certificationAssessmentHistoryRepository} CertificationAssessmentHistoryRepository
 * @typedef {scoringConfigurationRepository} ScoringConfigurationRepository
 * @typedef {assessmentSheetRepository} AssessmentSheetRepository
 * @typedef {certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {evaluationSessionRepository} EvaluationSessionRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {complementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {answerRepository} AnswerRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {calibratedChallengeRepository} CalibratedChallengeRepository
 * @typedef {sessionManagementCertificationChallengeRepository} SessionManagementCertificationChallengeRepository
 * @typedef {correctionApi} CorrectionApi
 * @typedef {versionApi} VersionApi
 * @typedef {certificationCompletedJobRepository} CertificationCompletedJobRepository
 * @typedef {services} Services
 */
const dependencies = {
  complementaryCertificationCourseResultRepository,
  certificationAssessmentHistoryRepository,
  scoringConfigurationRepository,
  assessmentSheetRepository,
  evaluationSessionRepository,
  sessionManagementCertificationChallengeRepository,
  challengeCalibrationRepository,
  certificationCandidateRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  assessmentResultRepository,
  answerRepository,
  calibratedChallengeRepository,
  sharedCompetenceMarkRepository,
  sharedChallengeRepository,
  userRepository,
  flashAlgorithmService,
  certificationBadgesService,
  pickChallengeService,
  placementProfileService,
  certificationCenterRepository,
  certificationCompanionAlertRepository,
  certificationCourseRepository,
  certificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository,
  certificationChallengeLiveAlertRepository,
  pixPlusCertificationCourseRepository,
  correctionApi,
  versionApi,
  certificationCompletedJobRepository,
  services,
};

const usecasesWithoutInjectedDependencies = {
  createCompanionAlert,
  deneutralizeChallenge,
  getNextChallenge,
  getCertificationCourse,
  neutralizeChallenge,
  rescoreV2Certification,
  retrieveLastOrCreateCertificationCourse,
  simulateFlashAssessmentScenario,
  scoreV3Certification,
  completeCertificationAssessment,
  simulateCapacityFromScore,
  simulateScoreFromCapacity,
  evaluateAndSaveAnswer,
  createLiveAlert,
};
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
