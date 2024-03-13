// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { assessmentRepository, sessionRepositories } from '../../infrastructure/repositories/index.js';
import * as certificationCpfService from '../services/certification-cpf-service.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as sessionsImportValidationService from '../services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/temporary-sessions-storage-for-mass-import-service.js';
import * as sessionValidator from '../validators/session-validator.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CandidateRepository} CandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CenterRepository} CenterRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('../validators/session-validator.js')} SessionValidator
 * @typedef {import('../services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../services/temporary-sessions-storage-for-mass-import-service.js').TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationReportRepository} CertificationReportRepository
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {temporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {sessionValidator} SessionValidator
 **/
const dependencies = {
  assessmentRepository,
  certificationCourseRepository: sessionRepositories.certificationCourseRepository,
  certificationCenterRepository: sessionRepositories.certificationCenterRepository,
  candidateRepository: sessionRepositories.candidateRepository,
  centerRepository: sessionRepositories.centerRepository,
  certificationCandidateRepository: sessionRepositories.certificationCandidateRepository,
  certificationChallengeLiveAlertRepository: sessionRepositories.certificationChallengeLiveAlertRepository,
  certificationCpfService,
  sessionCodeService,
  sessionsImportValidationService,
  certificationCpfCityRepository: sessionRepositories.certificationCpfCityRepository,
  certificationCpfCountryRepository: sessionRepositories.certificationCpfCountryRepository,
  certificationOfficerRepository: sessionRepositories.certificationOfficerRepository,
  complementaryCertificationRepository: sessionRepositories.complementaryCertificationRepository,
  finalizedSessionRepository: sessionRepositories.finalizedSessionRepository,
  jurySessionRepository: sessionRepositories.jurySessionRepository,
  sessionForInvigilatorKitRepository: sessionRepositories.sessionForInvigilatorKitRepository,
  issueReportCategoryRepository: sessionRepositories.issueReportCategoryRepository,
  certificationIssueReportRepository: sessionRepositories.certificationIssueReportRepository,
  sessionRepository: sessionRepositories.sessionRepository,
  certificationReportRepository: sessionRepositories.certificationReportRepository,
  temporarySessionsStorageForMassImportService,
  sessionValidator,
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
    ignoredFileNames: [
      'index.js',
      'delete-session.js',
      'delete-unlinked-certification-candidate.js',
      'get-attendance-sheet.js',
      'get-cpf-presigned-urls.js',
      'integrate-cpf-processing-receipts.js',
      'update-session.js',
      'upload-cpf-files.js',
    ],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
