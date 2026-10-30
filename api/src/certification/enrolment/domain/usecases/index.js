import * as organizationLearnerRepository from '../../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as countryRepository from '../../../../shared/infrastructure/repositories/country-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as attendanceSheetPdfUtils from '../../../enrolment/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as eventAdapter from '../../infrastructure/adapters/event-adapter.js';
import * as sessionAuthorizationAdapter from '../../infrastructure/adapters/session-authorization-adapter.js';
import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as certificationCandidatesOdsService from '../services/certification-candidates-ods-service.js';
import * as eligibilityService from '../services/eligibility-service.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as sessionsImportValidationService from '../services/sessions-import-validation-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/temporary-sessions-storage-for-mass-import-service.js';
import * as sessionValidator from '../validators/session-validator.js';
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
import { getEnrolledCandidatesInSession } from './get-enrolled-candidates-in-session.js';
import { getMassImportTemplateInformation } from './get-mass-import-template-information.js';
import { getUserCertificationEligibility } from './get-user-certification-eligibility.js';
import { hasBeenCandidate } from './has-been-candidate.js';
import { importCertificationCandidatesFromCandidatesImportSheet } from './import-certification-candidates-from-candidates-import-sheet.js';
import { registerCandidateParticipation } from './register-candidate-participation.js';
import { updateEnrolledCandidate } from './update-enrolled-candidate.js';
import { updateSession } from './update-session.js';
import { validateSessions } from './validate-sessions.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {CandidateRepository} CandidateRepository
 * @typedef {ComplementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {ComplementaryCertificationBadgeWithOffsetVersionRepository} ComplementaryCertificationBadgeWithOffsetVersionRepository
 * @typedef {CenterRepository} CenterRepository
 * @typedef {SessionRepository} SessionRepository
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
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {eventAdapter} EventAdapter
 * @typedef {sessionAuthorizationAdapter} SessionAuthorizationAdapter
 *
 **/
const dependencies = {
  certificationBadgesService,
  sessionCodeService,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
  sessionValidator,
  attendanceSheetPdfUtils,
  certificationCpfService,
  certificationCandidatesOdsService,
  eligibilityService,
  placementProfileService,
  organizationLearnerRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  countryRepository,
  eventAdapter,
  sessionAuthorizationAdapter,
  candidateRepository,
};

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
  getEnrolledCandidatesInSession,
  getMassImportTemplateInformation,
  getUserCertificationEligibility,
  hasBeenCandidate,
  importCertificationCandidatesFromCandidatesImportSheet,
  updateEnrolledCandidate,
  updateSession,
  validateSessions,
  registerCandidateParticipation,
};

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
