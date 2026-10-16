import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as eventJobPublisherService from '../../../../shared/infrastructure/jobs/event-job-publisher-service.js';
import * as answerRepository from '../../../../shared/infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { certificationCenterMembershipRepository } from '../../../../team/infrastructure/repositories/certification-center-membership.repository.js';
import * as versionApi from '../../../configuration/application/api/version-api.js';
import { createLiveAlert } from '../../../evaluation/domain/usecases/create-live-alert.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationIssueReportRepository from '../../../shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as sharedCompetenceMarkRepository from '../../../shared/infrastructure/repositories/competence-mark-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as certificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';
import * as certificationRepository from '../../infrastructure/repositories/certification-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as cpfExportRepository from '../../infrastructure/repositories/cpf-export-repository.js';
import * as finalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import * as juryCertificationRepository from '../../infrastructure/repositories/jury-certification-repository.js';
import { publishSessionJobRepository } from '../../infrastructure/repositories/publish-session-job-repository.js';
import * as sessionJuryCommentRepository from '../../infrastructure/repositories/session-jury-comment-repository.js';
import * as sessionManagementRepository from '../../infrastructure/repositories/session-management-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as sessionSummaryRepository from '../../infrastructure/repositories/session-summary-repository.js';
import { cpfExportsStorage } from '../../infrastructure/storage/cpf-exports-storage.js';
import { mailService } from '../services/mail-service.js';
import { abortCertificationCourse } from './abort-certification-course.js';
import { assignCertificationOfficerToJurySession } from './assign-certification-officer-to-jury-session.js';
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
import { getV3CertificationCourseDetailsForAdministration } from './get-v3-certification-course-details-for-administration.js';
import { manuallyResolveCertificationIssueReport } from './manually-resolve-certification-issue-report.js';
import { processAutoJury } from './process-auto-jury.js';
import { publishSession } from './publish-session.js';
import { registerPublishableSession } from './register-publishable-session.js';
import { rejectCertificationCourse } from './reject-certification-course.js';
import { requestMultipleSessionPublication } from './request-multiple-session-publication.js';
import { requestSessionPublication } from './request-session-publication.js';
import { saveCertificationIssueReport } from './save-certification-issue-report.js';
import { saveJuryComplementaryCertificationCourseResult } from './save-jury-complementary-certification-course-result.js';
import {
  sendCleaSessionResultsToReferers,
  sendSessionResultsToPrescribers,
} from './send-session-results-to-referers.usecase.js';
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
 * @typedef {import('../../../shared/infrastructure/repositories/certification-course-repository.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../infrastructure/repositories/jury-certification-summary-repository.js').JuryCertificationSummaryRepository} JuryCertificationSummaryRepository
 * @typedef {import('../../infrastructure/repositories/invigilator-access-repository.js').InvigilatorAccessRepository} InvigilatorAccessRepository
 * @typedef {import('../../infrastructure/repositories/certification-officer-repository.js').CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {import('../../../shared/infrastructure/repositories/certification-issue-report-repository.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {import('../../infrastructure/repositories/finalized-session-repository.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../infrastructure/repositories/jury-certification-repository.js').JuryCertificationRepository} JuryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/jury-session-repository.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../infrastructure/repositories/session-for-invigilator-kit-repository.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/assessment-repository.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/assessment-result-repository.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../../infrastructure/repositories/competence-mark-repository.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/challenge-repository.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../../infrastructure/repositories/certification-repository.js').CertificationRepository} CertificationRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/answer-repository.js').AnswerRepository} AnswerRepository
 * @typedef {import('../../../shared/infrastructure/repositories/issue-report-category-repository.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('../../infrastructure/repositories/session-jury-comment-repository.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {import('../../infrastructure/repositories/session-management-repository.js').SessionManagementRepository} SessionManagementRepository
 * @typedef {import('../../infrastructure/repositories/invigilator-session-repository.js').InvigilatorSessionRepository} InvigilatorSessionRepository
 * @typedef {import('../../../shared/infrastructure/repositories/certification-report-repository.js').CertificationReportRepository} CertificationReportRepository
 * @typedef {import('../../infrastructure/repositories/competence-mark-repository.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../../shared/infrastructure/repositories/complementary-certification-course-result-repository.js').ComplementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {import('../../../shared/infrastructure/repositories/certification-assessment-repository.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('../../../enrolment/infrastructure/repositories/certification-cpf-city-repository.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../../enrolment/infrastructure/repositories/certification-cpf-country-repository.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/repositories/certification-candidate-repository.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('../../infrastructure/storage/cpf-exports-storage.js').cpfExportsStorage} CpfExportsStorage
 * @typedef {import('../../../../shared/domain/services/placement-profile-service.js')} PlacementProfileService
 * @typedef {import('../../../shared/domain/services/certification-cpf-service.js')} CertificationCpfService
 * @typedef {import('../../infrastructure/repositories/certification-companion-alert-repository.js').CertificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {import('../../infrastructure/repositories/certification-evaluation-repository.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {import('../../../../identity-access-management/infrastructure/repositories/user.repository.js')} UserRepository
 * @typedef {import('../../../../team/infrastructure/repositories/certification-center-membership.repository.js')} CertificationCenterMembershipRepository
 * @typedef {import('../../infrastructure/repositories/certification-center-access-repository.js').CertificationCenterAccessRepository} CertificationCenterAccessRepository
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {certificationRepository} CertificationRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {juryCertificationRepository} JuryCertificationRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {sessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {invigilatorSessionRepository} InvigilatorSessionRepository
 * @typedef {sessionSummaryRepository} SessionSummaryRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {cpfExportsStorage} CpfExportsStorage
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {cpfExportRepository} CpfExportRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationCompanionAlertRepository} CertificationCompanionAlertRepository
 * @typedef {userRepository} UserRepository
 * @typedef {CertificationCenterMembershipRepository} CertificationCenterMembershipRepository
 **/
const dependencies = {
  sessionSummaryRepository,
  assessmentRepository,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  sessionJuryCommentRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportsStorage,
  cpfExportRepository,
  placementProfileService,
  finalizedSessionRepository,
  certificationCpfService,
  eventJobPublisherService,
  mailService,
  certificationCenterRepository,
  certificationRepository,
  certificationIssueReportRepository,
  certificationCenterMembershipRepository,
  publishSessionJobRepository,
  juryCertificationRepository,
  certificationCompanionAlertRepository,
  sessionManagementRepository,
  versionApi,
  userRepository,
  sessionRepository,
};

const usecasesWithoutInjectedDependencies = {
  abortCertificationCourse,
  assignCertificationOfficerToJurySession,
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
  getSession,
  getV3CertificationCourseDetailsForAdministration,
  manuallyResolveCertificationIssueReport,
  processAutoJury,
  publishSession,
  requestSessionPublication,
  requestMultipleSessionPublication,
  registerPublishableSession,
  rejectCertificationCourse,
  saveCertificationIssueReport,
  saveJuryComplementaryCertificationCourseResult,
  sendCleaSessionResultsToReferers,
  sendSessionResultsToPrescribers,
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

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
