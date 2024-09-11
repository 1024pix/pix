// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
/**
 * @typedef {import('../../infrastructure/repositories/index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 **/
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {EnrolledCandidateRepository} EnrolledCandidateRepository
 **/
const dependencies = {
  ...enrolmentRepositories,
};

const path = dirname(fileURLToPath(import.meta.url));
const servicesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};
const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies);

export { services };
