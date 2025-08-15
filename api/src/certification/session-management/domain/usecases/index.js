import { abortCertificationCourse } from './abort-certification-course.js';
import { assignCertificationOfficerToJurySession } from './assign-certification-officer-to-jury-session.js';
import { authorizeCertificationCandidateToResume } from './authorize-certification-candidate-to-resume.js';
import { authorizeCertificationCandidateToStart } from './authorize-certification-candidate-to-start.js';
import { cancel } from './cancel.js';
import { clearCompanionAlert } from './clear-companion-alert.js';
import { commentSessionAsJury } from './comment-session-as-jury.js';
import { correctCandidateIdentityInCertificationCourse } from './correct-candidate-identity-in-certification-course.js';
import { createCertificationChallengeLiveAlert } from './create-certification-challenge-live-alert.js';
import { deleteCertificationIssueReport } from './delete-certification-issue-report.js';
import { deleteSessionJuryComment } from './delete-session-jury-comment.js';
import { dismissLiveAlert } from './dismiss-live-alert.js';
import { endAssessmentBySupervisor } from './end-assessment-by-supervisor.js';
import { finalizeSession } from './finalize-session.js';
import { findFinalizedSessionsToPublish } from './find-finalized-sessions-to-publish.js';
import { findFinalizedSessionsWithRequiredAction } from './find-finalized-sessions-with-required-action.js';
import { findPaginatedCertificationCenterSessionSummaries } from './find-paginated-certification-center-session-summaries.js';
import { getCertificationDetails } from './get-certification-details.js';
import { getPreSignedUrls } from './get-cpf-presigned-urls.js';
import { getInvigilatorKitSessionInfo } from './get-invigilator-kit-session-info.js';
import { getJuryCertification } from './get-jury-certification.js';
import { getJurySession } from './get-jury-session.js';
import { getSession } from './get-session.js';
import { getSessionForSupervising } from './get-session-for-supervising.js';
import { getV3CertificationCourseDetailsForAdministration } from './get-v3-certification-course-details-for-administration.js';
import { integrateCpfProccessingReceipts } from './integrate-cpf-processing-receipts.js';
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
import { updateJuryComment } from './update-jury-comment.js';
import { uploadCpfFiles } from './upload-cpf-files.js';
import { validateLiveAlert } from './validate-live-alert.js';

const usecases = {
  abortCertificationCourse,
  assignCertificationOfficerToJurySession,
  authorizeCertificationCandidateToResume,
  authorizeCertificationCandidateToStart,
  cancel,
  clearCompanionAlert,
  commentSessionAsJury,
  correctCandidateIdentityInCertificationCourse,
  createCertificationChallengeLiveAlert,
  deleteCertificationIssueReport,
  deleteSessionJuryComment,
  dismissLiveAlert,
  endAssessmentBySupervisor,
  finalizeSession,
  findFinalizedSessionsToPublish,
  findFinalizedSessionsWithRequiredAction,
  findPaginatedCertificationCenterSessionSummaries,
  getCertificationDetails,
  getPreSignedUrls,
  getInvigilatorKitSessionInfo,
  getJuryCertification,
  getJurySession,
  getSessionForSupervising,
  getSession,
  getV3CertificationCourseDetailsForAdministration,
  integrateCpfProccessingReceipts,
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
};

export { usecases };
