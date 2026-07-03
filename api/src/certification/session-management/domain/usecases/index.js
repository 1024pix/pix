import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import * as flashAlgorithmService from '../../../evaluation/domain/services/algorithm-methods/flash.js';
import { createLiveAlert } from '../../../evaluation/domain/usecases/create-live-alert.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationChallengeRepository,
  certificationIssueReportRepository,
  certificationRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportRepository,
  repositories,
  sessionSummaryRepository,
  sharedCompetenceMarkRepository,
} from '../../infrastructure/repositories/index.js';
import { cpfExportsStorage } from '../../infrastructure/storage/cpf-exports-storage.js';
import * as sessionPublicationService from '../services/session-publication-service.js';
import { abortCertificationCourse } from './abort-certification-course.js';
import { assignCertificationOfficerToJurySession } from './assign-certification-officer-to-jury-session.js';
import { authorizeCertificationCandidateToResume } from './authorize-certification-candidate-to-resume.js';
import { authorizeCertificationCandidateToStart } from './authorize-certification-candidate-to-start.js';
import { cancel } from './cancel.js';
import { clearCompanionAlert } from './clear-companion-alert.js';
import { commentSessionAsJury } from './comment-session-as-jury.js';
import { correctCandidateIdentityInCertificationCourse } from './correct-candidate-identity-in-certification-course.js';
import { deleteCertificationIssueReport } from './delete-certification-issue-report.js';
import { deleteSessionJuryComment } from './delete-session-jury-comment.js';
import { dismissLiveAlert } from './dismiss-live-alert.js';
import { endAssessmentByInvigilator } from './end-assessment-by-invigilator.js';
import { finalizeSession } from './finalize-session.js';
import { findFinalizedSessionsToPublish } from './find-finalized-sessions-to-publish.js';
import { findFinalizedSessionsWithRequiredAction } from './find-finalized-sessions-with-required-action.js';
import { findPaginatedFilteredCertificationCenterSessionSummaries } from './find-paginated-filtered-certification-center-session-summaries.js';
import { getCertificationDetails } from './get-certification-details.js';
import { getPreSignedUrls } from './get-cpf-presigned-urls.js';
import { getInvigilatorKitSessionInfo } from './get-invigilator-kit-session-info.js';
import { getJuryCertification } from './get-jury-certification.js';
import { getJurySession } from './get-jury-session.js';
import { getSession } from './get-session.js';
import { getSessionForSupervising } from './get-session-for-supervising.js';
import { getV3CertificationCourseDetailsForAdministration } from './get-v3-certification-course-details-for-administration.js';
import { manuallyResolveCertificationIssueReport } from './manually-resolve-certification-issue-report.js';
import { processAutoJury } from './process-auto-jury.js';
import { publishSession } from './publish-session.js';
import { publishSessionsInBatch } from './publish-sessions-in-batch.js';
import { registerPublishableSession } from './register-publishable-session.js';
import { rejectCertificationCourse } from './reject-certification-course.js';
import { saveCertificationIssueReport } from './save-certification-issue-report.js';
import { saveJuryComplementaryCertificationCourseResult } from './save-jury-complementary-certification-course-result.js';
import { superviseSession } from './supervise-session.js';
import { uncancel } from './uncancel.js';
import { unfinalizeSession } from './unfinalize-session.js';
import { unpublishSession } from './unpublish-session.js';
import { unrejectCertificationCourse } from './unreject-certification-course.js';
import { updateEduV3ExternalJuryResult } from './update-edu-v3-external-jury-result.js';
import { updateJuryComment } from './update-jury-comment.js';
import { uploadCpfFiles } from './upload-cpf-files.js';
import { validateLiveAlert } from './validate-live-alert.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JuryCertificationSummaryRepository} JuryCertificationSummaryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').InvigilatorAccessRepository} InvigilatorAccessRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JuryCertificationRepository} JuryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationRepository} CertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AnswerRepository} AnswerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionManagementRepository} SessionManagementRepository
 * @typedef {import('../../infrastructure/repositories/index.js').InvigilatorSessionRepository} InvigilatorSessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationReportRepository} CertificationReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../infrastructure/storage/cpf-exports-storage.js').cpfExportsStorage} CpfExportsStorage
 * @typedef {import('../../../shared/domain/services/certification-badges-service.js')} CertificationBadgesService
 * @typedef {import('../services/session-publication-service.js')} SessionPublicationService
 * @typedef {import('../../../../shared/domain/services/placement-profile-service.js')} PlacementProfileService
 * @typedef {import('../../../shared/domain/services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCenterAccessRepository} CertificationCenterAccessRepository
 * @typedef {import('../../../../identity-access-management/infrastructure/repositories/user.repository.js')} UserRepository
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {certificationChallengeRepository} CertificationChallengeRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {certificationRepository} CertificationRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {juryCertificationRepository} JuryCertificationRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {sessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {sessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {sessionManagementRepository} SessionManagementRepository
 * @typedef {invigilatorSessionRepository} InvigilatorSessionRepository
 * @typedef {sessionSummaryRepository} SessionSummaryRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {cpfExportsStorage} CpfExportsStorage
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {mailService} MailService
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {sessionPublicationService} SessionPublicationService
 * @typedef {cpfExportRepository} CpfExportRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {userRepository} UserRepository
 * @typedef {CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 **/
const dependencies = {
  ...repositories,
  sessionSummaryRepository,
  assessmentRepository,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportsStorage,
  cpfExportRepository,
  certificationBadgesService,
  placementProfileService,
  certificationCpfService,
  certificationCenterRepository,
  certificationChallengeRepository,
  certificationRepository,
  certificationIssueReportRepository,
  flashAlgorithmService,
  sessionPublicationService,
  versionApi,
  userRepository,
};

const usecasesWithoutInjectedDependencies = {
  abortCertificationCourse,
  assignCertificationOfficerToJurySession,
  authorizeCertificationCandidateToResume,
  authorizeCertificationCandidateToStart,
  cancel,
  clearCompanionAlert,
  commentSessionAsJury,
  correctCandidateIdentityInCertificationCourse,
  createCertificationChallengeLiveAlert: createLiveAlert,
  deleteCertificationIssueReport,
  deleteSessionJuryComment,
  dismissLiveAlert,
  endAssessmentByInvigilator,
  finalizeSession,
  findFinalizedSessionsToPublish,
  findFinalizedSessionsWithRequiredAction,
  findPaginatedFilteredCertificationCenterSessionSummaries,
  getCertificationDetails,
  getPreSignedUrls,
  getInvigilatorKitSessionInfo,
  getJuryCertification,
  getJurySession,
  getSessionForSupervising,
  getSession,
  getV3CertificationCourseDetailsForAdministration,
  manuallyResolveCertificationIssueReport,
  processAutoJury,
  publishSession,
  publishSessionsInBatch,
  registerPublishableSession,
  rejectCertificationCourse,
  saveCertificationIssueReport,
  saveJuryComplementaryCertificationCourseResult,
  superviseSession,
  uncancel,
  unfinalizeSession,
  unpublishSession,
  unrejectCertificationCourse,
  updateJuryComment,
  uploadCpfFiles,
  validateLiveAlert,
  updateEduV3ExternalJuryResult,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
