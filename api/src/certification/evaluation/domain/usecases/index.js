import * as certificationChallengeLiveAlertRepository from '../../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../../certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as correctionApi from '../../../../evaluation/application/api/correction-api.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as sharedChallengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import * as verifyCertificateCodeService from '../../../evaluation/domain/services/verify-certificate-code-service.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as sessionManagementCertificationChallengeRepository from '../../../shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as sharedCompetenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as candidateAuthorizationAdapter from '../../infrastructure/adapters/candidate-authorization-adapter.js';
import * as sessionAdapter from '../../infrastructure/adapters/session-adapter.js';
import * as assessmentSheetRepository from '../../infrastructure/repositories/assessment-sheet-repository.js';
import * as calibratedChallengeRepository from '../../infrastructure/repositories/calibrated-challenge-repository.js';
import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as certificationAssessmentHistoryRepository from '../../infrastructure/repositories/certification-assessment-history-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { certificationCompletedJobRepository } from '../../infrastructure/repositories/jobs/certification-completed-job-repository.js';
import * as scoringConfigurationRepository from '../../infrastructure/repositories/scoring-configuration-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/session-repository.js';
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
 * @typedef {sessionRepository} SessionRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {complementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {answerRepository} AnswerRepository
 * @typedef {sharedChallengeRepository} SharedChallengeRepository
 * @typedef {calibratedChallengeRepository} CalibratedChallengeRepository
 * @typedef {sessionManagementCertificationChallengeRepository} SessionManagementCertificationChallengeRepository
 * @typedef {correctionApi} CorrectionApi
 * @typedef {versionApi} VersionApi
 * @typedef {candidateAuthorizationAdapter} CandidateAuthorizationAdapter
 * @typedef {sessionAdapter} SessionAdapter
 * @typedef {certificationCompletedJobRepository} CertificationCompletedJobRepository
 * @typedef {services} Services
 */
const dependencies = {
  complementaryCertificationCourseResultRepository,
  certificationAssessmentHistoryRepository,
  scoringConfigurationRepository,
  assessmentSheetRepository,
  sessionRepository,
  sessionManagementCertificationChallengeRepository,
  candidateRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  assessmentResultRepository,
  answerRepository,
  calibratedChallengeRepository,
  sharedCompetenceMarkRepository,
  sharedChallengeRepository,
  flashAlgorithmService,
  certificationBadgesService,
  pickChallengeService,
  certificationCompanionAlertRepository,
  certificationCourseRepository,
  certificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository,
  certificationChallengeLiveAlertRepository,
  correctionApi,
  versionApi,
  candidateAuthorizationAdapter,
  sessionAdapter,
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
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
