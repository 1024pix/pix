import * as certificationIssueReportRepository from '../../../../certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as issueReportCategoryRepository from '../../../../certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as certificationCandidateForSupervisingRepository from './certification-candidate-for-supervising-repository.js';
import * as certificationOfficerRepository from './certification-officer-repository.js';
import * as competenceMarkRepository from './competence-mark-repository.js';
import * as finalizedSessionRepository from './finalized-session-repository.js';
import * as jurySessionRepository from './jury-session-repository.js';
import * as sessionForInvigilatorKitRepository from './session-for-invigilator-kit-repository.js';
import * as sessionForSupervisingRepository from './session-for-supervising-repository.js';
import * as sessionJuryCommentRepository from './session-jury-comment-repository.js';
import * as sessionRepository from './session-repository.js';
import * as supervisorAccessRepository from './supervisor-access-repository.js';

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
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {sessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {sessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {supervisorAccessRepository} SupervisorAccessRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 */
const repositoriesWithoutInjectedDependencies = {
  assessmentRepository,
  certificationAssessmentRepository,
  certificationCandidateForSupervisingRepository,
  certificationCourseRepository,
  certificationChallengeLiveAlertRepository,
  certificationOfficerRepository,
  competenceMarkRepository,
  finalizedSessionRepository,
  jurySessionRepository,
  sessionForInvigilatorKitRepository,
  issueReportCategoryRepository,
  certificationIssueReportRepository,
  sessionRepository,
  sessionForSupervisingRepository,
  sessionJuryCommentRepository,
  supervisorAccessRepository,
  certificationReportRepository,
  complementaryCertificationCourseResultRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 */
const dependencies = {};
const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);
export { assessmentRepository, sessionRepositories };
