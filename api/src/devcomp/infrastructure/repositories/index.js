import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

import * as moduleRepository from './module-repository.js';

import moduleDatasource from '../datasources/learning-content/module-datasource.js';

const repositoriesWithoutInjectedDependencies = {
  moduleRepository,
};

const dependencies = {
  moduleDatasource,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
