import * as certificationIssueReportRepository from '../../../../certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as issueReportCategoryRepository from '../../../../certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as certificationCpfCityRepository from '../../../enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../../enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationChallengeRepository from '../../../shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as sharedCompetenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as certificationCandidateForSupervisingRepository from './certification-candidate-for-supervising-repository.js';
import * as certificationCandidateRepository from './certification-candidate-repository.js';
import * as certificationCompanionAlertRepository from './certification-companion-alert-repository.js';
import * as certificationOfficerRepository from './certification-officer-repository.js';
import * as competenceMarkRepository from './competence-mark-repository.js';
import * as courseAssessmentResultRepository from './course-assessment-result-repository.js';
import * as cpfExportRepository from './cpf-export-repository.js';
import * as finalizedSessionRepository from './finalized-session-repository.js';
import * as juryCertificationRepository from './jury-certification-repository.js';
import * as juryCertificationSummaryRepository from './jury-certification-summary-repository.js';
import * as jurySessionRepository from './jury-session-repository.js';
import * as sessionForInvigilatorKitRepository from './session-for-invigilator-kit-repository.js';
import * as sessionForSupervisingRepository from './session-for-supervising-repository.js';
import * as sessionJuryCommentRepository from './session-jury-comment-repository.js';
import * as sessionRepository from './session-repository.js';
import * as supervisorAccessRepository from './supervisor-access-repository.js';
import * as v3CertificationCourseDetailsForAdministrationRepository from './v3-certification-course-details-for-administration-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {juryCertificationRepository} JuryCertificationRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {sessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {sessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {supervisorAccessRepository} SupervisorAccessRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {v3CertificationCourseDetailsForAdministrationRepository} V3CertificationCourseDetailsForAdministrationRepository
 * @typedef {competenceRepository} CompetenceRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {certificationChallengeRepository} CertificationChallengeRepository
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {courseAssessmentResultRepository} CourseAssessmentResultRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {flashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {cpfExportRepository} CpfExportRepository
 * @typedef {juryCertificationSummaryRepository} JuryCertificationSummaryRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {typeof certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 */
const repositoriesWithoutInjectedDependencies = {
  assessmentRepository,
  certificationAssessmentRepository,
  certificationCandidateForSupervisingRepository,
  certificationCourseRepository,
  certificationChallengeLiveAlertRepository,
  certificationOfficerRepository,
  finalizedSessionRepository,
  juryCertificationRepository,
  juryCertificationSummaryRepository,
  jurySessionRepository,
  sessionForInvigilatorKitRepository,
  issueReportCategoryRepository,
  sessionRepository,
  sessionForSupervisingRepository,
  sessionJuryCommentRepository,
  certificationIssueReportRepository,
  supervisorAccessRepository,
  certificationReportRepository,
  v3CertificationCourseDetailsForAdministrationRepository,
  competenceRepository,
  challengeRepository,
  answerRepository,
  assessmentResultRepository,
  competenceMarkRepository,
  courseAssessmentResultRepository,
  complementaryCertificationCourseResultRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  certificationCandidateRepository,
  certificationCompanionAlertRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 */
const dependencies = {};
const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);
export {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationChallengeRepository,
  certificationIssueReportRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportRepository,
  flashAlgorithmConfigurationRepository,
  sessionRepositories,
  sharedCompetenceMarkRepository,
};
