// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as attendanceSheetPdfUtils from '../../../enrolment/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as certificationCpfService from '../services/certification-cpf-service.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as sessionsImportValidationService from '../services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/temporary-sessions-storage-for-mass-import-service.js';
import * as sessionValidator from '../validators/session-validator.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CandidateRepository} CandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository

 * @typedef {import('../../infrastructure/repositories/index.js').CenterRepository} CenterRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../validators/session-validator.js')} SessionValidator
 * @typedef {import('../services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../../../enrolment/infrastructure/utils/pdf/attendance-sheet-pdf.js')} AttendanceSheetPdfUtils
 * @typedef {import('../services/temporary-sessions-storage-for-mass-import-service.js').TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationReportRepository} CertificationReportRepository
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
* @typedef {candidateRepository} CandidateRepository
* @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
* @typedef {centerRepository} CenterRepository
* @typedef {sessionRepository} SessionRepository
* @typedef {certificationCandidateRepository} CertificationCandidateRepository
* @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
* @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
* @typedef {certificationOfficerRepository} CertificationOfficerRepository
* @typedef {certificationCenterRepository} CertificationCenterRepository
* @typedef {sessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository

 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {temporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {sessionValidator} SessionValidator
 * @typedef {attendanceSheetPdfUtils} AttendanceSheetPdfUtils
 * @typedef {temporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 **/
const dependencies = {
  ...enrolmentRepositories,
  sessionCodeService,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
  sessionValidator,
  attendanceSheetPdfUtils,
  certificationCpfService,
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
