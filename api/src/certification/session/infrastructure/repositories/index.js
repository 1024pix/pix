import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as complementaryCertificationApi from '../../../complementary-certification/application/api/complementary-api.js';
import * as complementaryCertificationRepository from './complementary-certification-repository.js';

const repositoriesWithoutInjectedDependencies = {
  complementaryCertificationRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationApi} ComplementaryCertificationApi
 */
const dependencies = {
  complementaryCertificationApi,
};

const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { sessionRepositories };
