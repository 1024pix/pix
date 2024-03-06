// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { assessmentRepository, sessionRepositories } from '../../infrastructure/repositories/index.js';
/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CandidateRepository} CandidateRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CenterRepository} CenterRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
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
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 **/
const dependencies = {
  assessmentRepository,
  candidateRepository: sessionRepositories.candidateRepository,
  centerRepository: sessionRepositories.centerRepository,
  certificationChallengeLiveAlertRepository: sessionRepositories.certificationChallengeLiveAlertRepository,
  certificationOfficerRepository: sessionRepositories.certificationOfficerRepository,
  complementaryCertificationRepository: sessionRepositories.complementaryCertificationRepository,
  finalizedSessionRepository: sessionRepositories.finalizedSessionRepository,
  jurySessionRepository: sessionRepositories.jurySessionRepository,
  sessionForInvigilatorKitRepository: sessionRepositories.sessionForInvigilatorKitRepository,
  issueReportCategoryRepository: sessionRepositories.issueReportCategoryRepository,
  certificationIssueReportRepository: sessionRepositories.certificationIssueReportRepository,
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
      'add-certification-candidate-to-session.js',
      'create-session.js',
      'create-sessions.js',
      'delete-session.js',
      'delete-unlinked-certification-candidate.js',
      'finalize-session.js',
      'get-attendance-sheet.js',
      'get-cpf-presigned-urls.js',
      'integrate-cpf-processing-receipts.js',
      'update-session.js',
      'upload-cpf-files.js',
      'validate-sessions.js',
    ],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
