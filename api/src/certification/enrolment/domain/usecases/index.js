import { addCandidateToSession } from './add-candidate-to-session.js';
import { candidateHasSeenCertificationInstructions } from './candidate-has-seen-certification-instructions.js';
import { createSession } from './create-session.js';
import { createSessions } from './create-sessions.js';
import { deleteSession } from './delete-session.js';
import { deleteUnlinkedCertificationCandidate } from './delete-unlinked-certification-candidate.js';
import { enrolStudentsToSession } from './enrol-students-to-session.js';
import { findCountries } from './find-countries.js';
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

const usecases = {
  addCandidateToSession,
  candidateHasSeenCertificationInstructions,
  createSession,
  createSessions,
  deleteSession,
  deleteUnlinkedCertificationCandidate,
  enrolStudentsToSession,
  findCountries,
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

export { usecases };
