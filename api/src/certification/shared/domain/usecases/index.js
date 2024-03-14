// eslint-disable import/no-restricted-paths

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as competenceMarkRepository from '../../../../../lib/infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificateRepository from '../../../course/infrastructure/repositories/certificate-repository.js';
import * as v3CertificationCourseDetailsForAdministrationRepository from '../../../course/infrastructure/repositories/v3-certification-course-details-for-administration-repository.js';
import * as flashAlgorithmService from '../../../flash-certification/domain/services/algorithm-methods/flash.js';
import * as flashAlgorithmConfigurationRepository from '../../../flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as sessionCodeService from '../../../session/domain/services/session-code-service.js';
import * as sessionsImportValidationService from '../../../session/domain/services/sessions-import-validation-service.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as candidateRepository from '../../../session/infrastructure/repositories/candidate-repository.js';
import * as cpfCertificationResultRepository from '../../../session/infrastructure/repositories/cpf-certification-result-repository.js';
import * as cpfExportRepository from '../../../session/infrastructure/repositories/cpf-export-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationIssueReportRepository from '../../../shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as issueReportCategoryRepository from '../../../shared/infrastructure/repositories/issue-report-category-repository.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as mailService from '../services/mail-service.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {badgeRepository} BadgeRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {competenceRepository} CompetenceRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {cpfExportRepository} CpfExportRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {mailService} MailService
 * @typedef {sessionCodeService} SessionCodeService
 * @typedef {cpfCertificationResultRepository} CpfCertificationResultRepository
 * @typedef {v3CertificationCourseDetailsForAdministrationRepository} V3CertificationCourseDetailsForAdministrationRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {sessionValidator} SessionValidator
 * @typedef {userRepository} UserRepository
 */
const dependencies = {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  candidateRepository,
  certificationAssessmentRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  certificationCourseRepository,
  certificationIssueReportRepository,
  certificationReportRepository,
  certificateRepository,
  challengeRepository,
  competenceMarkRepository,
  competenceRepository,
  complementaryCertificationRepository,
  flashAlgorithmService,
  flashAlgorithmConfigurationRepository,
  issueReportCategoryRepository,
  mailService,
  sessionCodeService,
  sessionsImportValidationService,
  cpfCertificationResultRepository,
  cpfExportRepository,
  sessionRepository,
  sessionValidator,
  userRepository,
  v3CertificationCourseDetailsForAdministrationRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

/**
 * TODO: move sub-domains usecases to their own index.js because it is currently crossing domains concerns
 * This file should inject usecases from the shared sub-domain only.
 */
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../course/domain/usecases/'),
    ignoredFileNames: ['index.js', 'update-jury-comment.js', 'get-sco-certification-results-by-division.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
