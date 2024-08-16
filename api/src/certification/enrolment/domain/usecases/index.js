// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as certificationCenterMembershipRepository from '../../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as attendanceSheetPdfUtils from '../../../enrolment/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as temporaryCompanionStorageService from '../../../shared/domain/services/temporary-companion-storage-service.js';
import * as sessionValidator from '../../../shared/domain/validators/session-validator.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as certificationCandidatesOdsService from '../services/certification-candidates-ods-service.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as sessionsImportValidationService from '../services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/temporary-sessions-storage-for-mass-import-service.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../../session-management/infrastructure/repositories/index.js').CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CandidateRepository} CandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CenterRepository} CenterRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CountryRepository} CountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').OrganizationRepository} OrganizationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCenterMembershipRepository} CertificationCenterMembershipRepository
 * @typedef {import('../../../shared/domain/validators/session-validator.js')} SessionValidator
 * @typedef {import('../../../shared/domain/services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../../infrastructure/utils/pdf/attendance-sheet-pdf.js')} AttendanceSheetPdfUtils
 * @typedef {import('../services/temporary-sessions-storage-for-mass-import-service.js').TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {import('../../../shared/domain/services/temporary-companion-storage-service.js')} TemporaryCompanionStorageService
 * @typedef {import('../../../shared/domain/services/certification-badges-service.js')} CertificationBadgesService
 * @typedef {import('../services/certification-candidates-ods-service.js')} CertificationCandidatesOdsService
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {CandidateRepository} CandidateRepository
 * @typedef {EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {CenterRepository} CenterRepository
 * @typedef {SessionRepository} SessionRepository
 * @typedef {CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 * @typedef {CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {CountryRepository} CountryRepository
 * @typedef {OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {OrganizationRepository} OrganizationRepository
 * @typedef {ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {CertificationCenterMembershipRepository} CertificationCenterMembershipRepository
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {SessionValidator} SessionValidator
 * @typedef {AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
 * @typedef {TemporaryCompanionStorageService} TemporaryCompanionStorageService
 * @typedef {CertificationBadgesService} CertificationBadgesService
 * @typedef {CertificationCandidatesOdsService} CertificationCandidatesOdsService
 **/
const dependencies = {
  certificationBadgesService,
  ...enrolmentRepositories,
  sessionCodeService,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
  sessionValidator,
  attendanceSheetPdfUtils,
  certificationCpfService,
  temporaryCompanionStorageService,
  certificationCenterMembershipRepository,
  organizationRepository,
  certificationCandidatesOdsService,
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
