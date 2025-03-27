import * as frameworksApi from '../../../../learning-content/application/api/frameworks-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as frameworkRepository from './framework-repository.js';

const repositoriesWithoutInjectedDependencies = {
  frameworkRepository,
};

const dependencies = {
  frameworksApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
