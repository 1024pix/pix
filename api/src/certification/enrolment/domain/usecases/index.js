// eslint-disable import/no-restricted-paths
import * as divisionRepository from '../../../../prescription/campaign/infrastructure/repositories/division-repository.js';
import * as organizationLearnerRepository from '../../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as countryRepository from '../../../../shared/infrastructure/repositories/country-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as attendanceSheetPdfUtils from '../../../enrolment/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as sessionValidator from '../../../shared/domain/validators/session-validator.js';
import * as certificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as eventAdapter from '../../infrastructure/adapters/event-adapter.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as certificationCandidatesOdsService from '../services/certification-candidates-ods-service.js';
import * as eligibilityService from '../services/eligibility-service.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as sessionsImportValidationService from '../services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/temporary-sessions-storage-for-mass-import-service.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationBadgeWithOffsetVersionRepository} ComplementaryCertificationBadgeWithOffsetVersionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../../session-management/infrastructure/repositories/index.js').CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CandidateRepository} CandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CenterRepository} CenterRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/index.js').CountryRepository} CountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/index.js').UserRepository} UserRepository
 * @typedef {import('../../../shared/domain/validators/session-validator.js')} SessionValidator
 * @typedef {import('../../../shared/domain/services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../../infrastructure/utils/pdf/attendance-sheet-pdf.js')} AttendanceSheetPdfUtils
 * @typedef {import('../services/temporary-sessions-storage-for-mass-import-service.js').TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {import('../services/certification-candidates-ods-service.js')} CertificationCandidatesOdsService
 * @typedef {import('../services/eligibility-service.js')} EligibilityService
 * @typedef {import('../../../../shared/domain/services/placement-profile-service.js')} PlacementProfileService
 * @typedef {import('../../../../shared/infrastructure/repositories/organization-repository.js')} organizationRepository
 * @typedef {import('../../../shared/infrastructure/repositories/certification-candidate-repository.js')} certificationCandidateRepository
 * @typedef {import('../../../../prescription/campaign/infrastructure/repositories/division-repository.js')} divisionRepository
 * @typedef {import('../../../shared/infrastructure/repositories/certification-center-repository.js')} CertificationCenterRepository
 * @typedef {import('../../infrastructure/adapters/event-adapter.js')} EventAdapter
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {CandidateRepository} CandidateRepository
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
 * @typedef {organizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {UserRepository} UserRepository
 * @typedef {ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {TemporarySessionsStorageForMassImportService} TemporarySessionsStorageForMassImportService
 * @typedef {SessionValidator} SessionValidator
 * @typedef {AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {CertificationCandidatesOdsService} CertificationCandidatesOdsService
 * @typedef {EligibilityService} EligibilityService
 * @typedef {PlacementProfileService} PlacementProfileService
 * @typedef {organizationRepository} OrganizationRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {divisionRepository} DivisionRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {eventAdapter} EventAdapter
 *
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
  divisionRepository,
  certificationCandidatesOdsService,
  eligibilityService,
  placementProfileService,
  organizationRepository,
  organizationLearnerRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  countryRepository,
  eventAdapter,
};

import { addCandidateToSession } from './add-candidate-to-session.js';
import { candidateHasSeenCertificationInstructions } from './candidate-has-seen-certification-instructions.js';
import { createSession } from './create-session.js';
import { createSessions } from './create-sessions.js';
import { deleteSession } from './delete-session.js';
import { deleteUnlinkedCertificationCandidate } from './delete-unlinked-certification-candidate.js';
import { enrolStudentsToSession } from './enrol-students-to-session.js';
import { findDivisionsByCertificationCenter } from './find-divisions-by-certification-center.js';
import { findStudentsForEnrolment } from './find-students-for-enrolment.js';
import { getAttendanceSheet } from './get-attendance-sheet.js';
import { getCandidate } from './get-candidate.js';
import { getCandidateImportSheetData } from './get-candidate-import-sheet-data.js';
import { getCandidateTimeline } from './get-candidate-timeline.js';
import { getCenter } from './get-center.js';
import { getCertificationCandidateSubscription } from './get-certification-candidate-subscription.js';
import { getEnrolledCandidatesInSession } from './get-enrolled-candidates-in-session.js';
import { getMassImportTemplateInformation } from './get-mass-import-template-information.js';
import { getSession } from './get-session.js';
import { getUserCertificationEligibility } from './get-user-certification-eligibility.js';
import { hasBeenCandidate } from './has-been-candidate.js';
import { importCertificationCandidatesFromCandidatesImportSheet } from './import-certification-candidates-from-candidates-import-sheet.js';
import { reconcileCandidate } from './reconcile-candidate.js';
import { updateEnrolledCandidate } from './update-enrolled-candidate.js';
import { updateSession } from './update-session.js';
import { validateSessions } from './validate-sessions.js';
import { verifyCandidateIdentity } from './verify-candidate-identity.js';
import { verifyCandidateReconciliationRequirements } from './verify-candidate-reconciliation-requirements.js';

const usecasesWithoutInjectedDependencies = {
  addCandidateToSession,
  candidateHasSeenCertificationInstructions,
  createSession,
  createSessions,
  deleteSession,
  deleteUnlinkedCertificationCandidate,
  enrolStudentsToSession,
  findDivisionsByCertificationCenter,
  findStudentsForEnrolment,
  getAttendanceSheet,
  getCandidateImportSheetData,
  getCandidateTimeline,
  getCandidate,
  getCenter,
  getCertificationCandidateSubscription,
  getEnrolledCandidatesInSession,
  getMassImportTemplateInformation,
  getSession,
  getUserCertificationEligibility,
  hasBeenCandidate,
  importCertificationCandidatesFromCandidatesImportSheet,
  reconcileCandidate,
  updateEnrolledCandidate,
  updateSession,
  validateSessions,
  verifyCandidateReconciliationRequirements,
  verifyCandidateIdentity,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
