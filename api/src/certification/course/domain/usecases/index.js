// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as certificationResultRepository from '../../../../../lib/infrastructure/repositories/certification-result-repository.js';
import * as competenceMarkRepository from '../../../../../lib/infrastructure/repositories/competence-mark-repository.js';
import * as assessmentResultRepository from '../../../../shared/infrastructure/repositories/assessment-result-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as courseAssessmentResultRepository from '../../infrastructure/repositories/course-assessment-result-repository.js';
import * as scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {courseAssessmentResultRepository} CourseAssessmentResultRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationResultRepository} CertificationResultRepository
 * @typedef {scoCertificationCandidateRepository} ScoCertificationCandidateRepository *
 **/
const dependencies = {
  assessmentResultRepository,
  competenceMarkRepository,
  courseAssessmentResultRepository,
  certificationResultRepository,
  scoCertificationCandidateRepository,
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
      'find-certification-attestations-for-division.js',
      'get-certification-attestation.js',
      'get-certification-attestations-for-session.js',
      'get-next-challenge-for-certification.js',
      'get-session-certification-reports.js',
      'get-v3-certification-course-details-for-administration.js',
      'reject-certification-course.js',
      'unreject-certification-course.js',
    ],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
