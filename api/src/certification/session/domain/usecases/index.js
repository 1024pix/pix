// eslint-disable import/no-restricted-paths
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';
/**
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 **/
import { sessionRepositories } from '../../../session/infrastructure/repositories/index.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 **/
const dependencies = {
  candidateRepository,
  centerRepository,
  complementaryCertificationRepository: sessionRepositories.complementaryCertificationRepository,
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
      'assign-certification-officer-to-jury-session.js',
      'create-session.js',
      'create-sessions.js',
      'delete-session.js',
      'delete-unlinked-certification-candidate.js',
      'dismiss-live-alert.js',
      'finalize-session.js',
      'get-attendance-sheet.js',
      'get-cpf-presigned-urls.js',
      'get-invigilator-kit-session-info.js',
      'integrate-cpf-processing-receipts.js',
      'update-session.js',
      'upload-cpf-files.js',
      'validate-live-alert.js',
      'validate-sessions.js',
    ],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
