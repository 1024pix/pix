import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as sessionEnrolmentRepository from '../../../enrolment/infrastructure/repositories/session-repository.js';
import * as sharedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import * as certificateSummaryRepository from '../../infrastructure/repositories/certificate-summary-repository.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as certificationLivretScolaireRepository from '../../infrastructure/repositories/certification-livret-scolaire-repository.js';
import * as certificationParcoursupRepository from '../../infrastructure/repositories/certification-parcoursup-repository.js';
import * as certificationResultRepository from '../../infrastructure/repositories/certification-result-repository.js';
import * as cleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository.js';
import * as competenceTreeRepository from '../../infrastructure/repositories/competence-tree-repository.js';
import * as resultRecipientRepository from '../../infrastructure/repositories/result-recipient-repository.js';
import * as scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';
import * as sessionForResultsSharingRepository from '../../infrastructure/repositories/session-for-results-sharing-repository.js';
import { getSessionCertificationResultsCsv } from '../../infrastructure/utils/csv/certification-results/get-session-certification-results-csv.js';
import { findCertificatesForDivision } from './find-certificates-for-division.js';
import { findCertificationAttestationsForDivision } from './find-certification-attestations-for-division.js';
import { findUserCertificateSummaries } from './find-user-certificate-summaries.js';
import { findUserCertificationCourses } from './find-user-certification-courses.js';
import { getCertificate } from './get-certificate.js';
import { getCertificatesForSession } from './get-certificates-for-session.js';
import { getCertificationCourseByVerificationCode } from './get-certification-course-by-verification-code.js';
import { getCertificationCourseVersion } from './get-certification-course-version.js';
import { getCertificationResultForParcoursup } from './get-certification-result-for-parcoursup.js';
import { getCertificationsResultsForLivretScolaire } from './get-certifications-results-for-livret-scolaire.js';
import { getCleaCertifiedCandidateBySession } from './get-clea-certified-candidate-by-session.js';
import { getPrivateCertificate } from './get-private-certificate.js';
import { getScoCertificationResultsByDivision } from './get-sco-certification-results-by-division.js';
import { getSessionCertificationReports } from './get-session-certification-reports.js';
import { getSessionResults } from './get-session-results.js';
import { getSessionResultsByResultRecipientEmail } from './get-session-results-by-result-recipient-email.js';
import { getShareableCertificate } from './get-shareable-certificate.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationResultRepository} CertificationResultRepository
 * @typedef {scoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {sharedCertificationCourseRepository} SharedCertificationCourseRepository
 * @typedef {certificateRepository} CertificateRepository
 * @typedef {certificationParcoursupRepository} CertificationParcoursupRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {cleaCertifiedCandidateRepository} CleaCertifiedCandidateRepository
 * @typedef {sessionEnrolmentRepository} SessionEnrolmentRepository
 * @typedef {resultRecipientRepository} resultRecipientRepository
 * @typedef {certificationLivretScolaireRepository} CertificationLivretScolaireRepository
 * @typedef {competenceTreeRepository} CompetenceTreeRepository
 * @typedef {certificateSummaryRepository} CertificateSummaryRepository
 **/

const dependencies = {
  certificationCourseRepository,
  sharedCertificationCourseRepository,
  certificationResultRepository,
  scoCertificationCandidateRepository,
  certificateRepository,
  certificationParcoursupRepository,
  certificationReportRepository,
  cleaCertifiedCandidateRepository,
  sessionEnrolmentRepository,
  resultRecipientRepository,
  sessionForResultsSharingRepository,
  competenceTreeRepository,
  certificationLivretScolaireRepository,
  certificateSummaryRepository,
};

const usecasesWithoutInjectedDependencies = {
  findCertificatesForDivision,
  findCertificationAttestationsForDivision,
  findUserCertificateSummaries,
  findUserCertificationCourses,
  getCertificate,
  getCertificatesForSession,
  getCertificationCourseByVerificationCode,
  getCertificationCourseVersion,
  getCertificationResultForParcoursup,
  getCertificationsResultsForLivretScolaire,
  getCleaCertifiedCandidateBySession,
  getPrivateCertificate,
  getScoCertificationResultsByDivision,
  getSessionCertificationReports,
  getSessionCertificationResultsCsv,
  getSessionResultsByResultRecipientEmail,
  getSessionResults,
  getShareableCertificate,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
