import { injectDependencies } from '../utils/dependency-injection.js';

import * as correctionRepository from './correction-repository.js';

import { fromDatasourceObject } from '../adapters/solution-adapter.js';
import * as tutorialRepository from './tutorial-repository.js';

const repositoriesWithoutInjectedDependencies = {
  correctionRepository,
};

const dependencies = {
  fromDatasourceObject,
  tutorialRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
