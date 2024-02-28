// eslint-disable import/no-restricted-paths

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as attendanceSheetPdfUtils from '../../../session/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import * as candidateRepository from '../../../session/infrastructure/repositories/candidate-repository.js';
import * as certificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../session/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as certificationIssueReportRepository from '../../../shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as competenceForScoringRepository from '../../../../../src/certification/scoring/infrastructure/repositories/competence-for-scoring-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import * as certificateRepository from '../../../course/infrastructure/repositories/certificate-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as certificationCpfCountryRepository from '../../../shared/infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationCpfCityRepository from '../../../shared/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationOfficerRepository from '../../../session/infrastructure/repositories/certification-officer-repository.js';
import * as competenceMarkRepository from '../../../../../lib/infrastructure/repositories/competence-mark-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as finalizedSessionRepository from '../../../session/infrastructure/repositories/finalized-session-repository.js';
import * as flashAlgorithmService from '../../../flash-certification/domain/services/algorithm-methods/flash.js';
import * as flashAlgorithmConfigurationRepository from '../../../flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as issueReportCategoryRepository from '../../../shared/infrastructure/repositories/issue-report-category-repository.js';
import * as jurySessionRepository from '../../../session/infrastructure/repositories/jury-session-repository.js';
import * as mailService from '../services/mail-service.js';
import * as certificationCpfService from '../services/certification-cpf-service.js';
import * as sessionCodeService from '../../../session/domain/services/session-code-service.js';
import * as sessionsImportValidationService from '../../../session/domain/services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../../../session/domain/services/temporary-sessions-storage-for-mass-import-service.js';
import * as sessionForAttendanceSheetRepository from '../../../session/infrastructure/repositories/session-for-attendance-sheet-repository.js';
import * as sessionForInvigilatorKitRepository from '../../../session/infrastructure/repositories/session-for-invigilator-kit-repository.js';
import * as cpfCertificationResultRepository from '../../../session/infrastructure/repositories/cpf-certification-result-repository.js';
import * as cpfExportRepository from '../../../session/infrastructure/repositories/cpf-export-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as v3CertificationCourseDetailsForAdministrationRepository from '../../../course/infrastructure/repositories/v3-certification-course-details-for-administration-repository.js';
import { cpfReceiptsStorage } from '../../../session/infrastructure/storage/cpf-receipts-storage.js';
import { cpfExportsStorage } from '../../../session/infrastructure/storage/cpf-exports-storage.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {attendanceSheetPdfUtils} AttendanceSheetPdfUtils
 * @typedef {badgeRepository} BadgeRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {competenceRepository} CompetenceRepository
 * @typedef {competenceForScoringRepository} CompetenceForScoringRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {cpfExportRepository} CpfExportRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {mailService} MailService
 * @typedef {sessionCodeService} SessionCodeService
 * @typedef {sessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {cpfCertificationResultRepository} CpfCertificationResultRepository
 * @typedef {v3CertificationCourseDetailsForAdministrationRepository} V3CertificationCourseDetailsForAdministrationRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {sessionValidator} SessionValidator
 * @typedef {userRepository} UserRepository
 * @typedef {cpfReceiptsStorage} CpfReceiptsStorage
 * @typedef {cpfExportsStorage} CpfExportsStorage
 */
const dependencies = {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  attendanceSheetPdfUtils,
  candidateRepository,
  certificationAssessmentRepository,
  certificationCandidateRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  certificationCourseRepository,
  certificationCpfService,
  competenceForScoringRepository,
  certificationIssueReportRepository,
  certificationOfficerRepository,
  certificationReportRepository,
  certificateRepository,
  challengeRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  competenceMarkRepository,
  competenceRepository,
  complementaryCertificationRepository,
  finalizedSessionRepository,
  flashAlgorithmService,
  flashAlgorithmConfigurationRepository,
  issueReportCategoryRepository,
  jurySessionRepository,
  mailService,
  sessionCodeService,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
  sessionForAttendanceSheetRepository,
  sessionForInvigilatorKitRepository,
  cpfCertificationResultRepository,
  cpfExportRepository,
  sessionRepository,
  sessionValidator,
  userRepository,
  v3CertificationCourseDetailsForAdministrationRepository,
  cpfReceiptsStorage,
  cpfExportsStorage,
};

const path = dirname(fileURLToPath(import.meta.url));

/**
 * TODO: move sub-domains usecases to their own index.js because it is currently crossing domains concerns
 * This file should inject usecases from the shared sub-domain only.
 */
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../session/domain/usecases/'),
    ignoredFileNames: [
      'index.js',
      'get-session-certification-candidates.js',
      'get-mass-import-template-information.js',
    ],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../flash-certification/domain/usecases/'),
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../scoring/domain/usecases/'),
  })),
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
