import { findCertificatesForDivision } from './find-certificates-for-division.js';
import { findCertificationAttestationsForDivision } from './find-certification-attestations-for-division.js';
import { findUserCertificationCourses } from './find-user-certification-courses.js';
import { findUserPrivateCertificates } from './find-user-private-certificates.js';
import { getCertificate } from './get-certificate.js';
import { getCertificatesForSession } from './get-certificates-for-session.js';
import { getCertificationCourseByVerificationCode } from './get-certification-course-by-verification-code.js';
import { getCertificationResultForParcoursup } from './get-certification-result-for-parcoursup.js';
import { getCertificationsResultsForLivretScolaire } from './get-certifications-results-for-livret-scolaire.js';
import { getCleaCertifiedCandidateBySession } from './get-clea-certified-candidate-by-session.js';
import { getPrivateCertificate } from './get-private-certificate.js';
import { getScoCertificationResultsByDivision } from './get-sco-certification-results-by-division.js';
import { getSessionCertificationReports } from './get-session-certification-reports.js';
import { getSessionResults } from './get-session-results.js';
import { getSessionResultsByResultRecipientEmail } from './get-session-results-by-result-recipient-email.js';
import { getShareableCertificate } from './get-shareable-certificate.js';

const usecases = {
  findCertificatesForDivision,
  findCertificationAttestationsForDivision,
  findUserCertificationCourses,
  findUserPrivateCertificates,
  getCertificate,
  getCertificatesForSession,
  getCertificationCourseByVerificationCode,
  getCertificationResultForParcoursup,
  getCertificationsResultsForLivretScolaire,
  getCleaCertifiedCandidateBySession,
  getPrivateCertificate,
  getScoCertificationResultsByDivision,
  getSessionCertificationReports,
  getSessionResultsByResultRecipientEmail,
  getSessionResults,
  getShareableCertificate,
};

export { usecases };
