// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as certificationResultRepository from '../../../../../lib/infrastructure/repositories/certification-result-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as sessionEnrolmentRepository from '../../../enrolment/infrastructure/repositories/session-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import * as cleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository.js';
import * as scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationResultRepository} CertificationResultRepository
 * @typedef {scoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificateRepository} CertificateRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {cleaCertifiedCandidateRepository} CleaCertifiedCandidateRepository
 * @typedef {sessionEnrolmentRepository} SessionEnrolmentRepository
 **/

const dependencies = {
  certificationCourseRepository,
  certificationResultRepository,
  scoCertificationCandidateRepository,
  certificateRepository,
  certificationReportRepository,
  cleaCertifiedCandidateRepository,
  sessionEnrolmentRepository,
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
