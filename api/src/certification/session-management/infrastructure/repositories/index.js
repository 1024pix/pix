import * as certificationIssueReportRepository from '../../../../certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as issueReportCategoryRepository from '../../../../certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as certificationOfficerRepository from './certification-officer-repository.js';
import * as finalizedSessionRepository from './finalized-session-repository.js';
import * as jurySessionRepository from './jury-session-repository.js';
import * as sessionForInvigilatorKitRepository from './session-for-invigilator-kit-repository.js';
import * as sessionRepository from './session-repository.js';
import * as supervisorAccessRepository from './supervisor-access-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {supervisorAccessRepository} SupervisorAccessRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 */
const repositoriesWithoutInjectedDependencies = {
  assessmentRepository,
  certificationCourseRepository,
  certificationChallengeLiveAlertRepository,
  certificationOfficerRepository,
  finalizedSessionRepository,
  jurySessionRepository,
  sessionForInvigilatorKitRepository,
  issueReportCategoryRepository,
  certificationIssueReportRepository,
  sessionRepository,
  supervisorAccessRepository,
  certificationReportRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 */
const dependencies = {};
const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);
export { assessmentRepository, sessionRepositories };
