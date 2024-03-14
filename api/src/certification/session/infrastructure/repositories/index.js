import * as certificationIssueReportRepository from '../../../../certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as issueReportCategoryRepository from '../../../../certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as complementaryCertificationApi from '../../../complementary-certification/application/api/complementary-certification-api.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as candidateRepository from './candidate-repository.js';
import * as centerRepository from './center-repository.js';
import * as certificationCandidateRepository from './certification-candidate-repository.js';
import * as certificationCpfCityRepository from './certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from './certification-cpf-country-repository.js';
import * as certificationOfficerRepository from './certification-officer-repository.js';
import * as complementaryCertificationRepository from './complementary-certification-repository.js';
import * as finalizedSessionRepository from './finalized-session-repository.js';
import * as jurySessionRepository from './jury-session-repository.js';
import * as sessionForInvigilatorKitRepository from './session-for-invigilator-kit-repository.js';
import * as sessionRepository from './session-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 */
const repositoriesWithoutInjectedDependencies = {
  assessmentRepository,
  complementaryCertificationRepository,
  candidateRepository,
  certificationCenterRepository,
  centerRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  certificationChallengeLiveAlertRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  certificationOfficerRepository,
  finalizedSessionRepository,
  jurySessionRepository,
  sessionForInvigilatorKitRepository,
  issueReportCategoryRepository,
  certificationIssueReportRepository,
  sessionRepository,
  certificationReportRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationApi} ComplementaryCertificationApi
 */
const dependencies = {
  complementaryCertificationApi,
};

const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { assessmentRepository, sessionRepositories };
