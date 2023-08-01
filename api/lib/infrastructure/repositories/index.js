import { injectDependencies } from '../utils/dependency-injection.js';

import * as correctionRepository from './correction-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';

import { fromDatasourceObject } from '../adapters/solution-adapter.js';
import * as tutorialRepository from './tutorial-repository.js';

const repositoriesWithoutInjectedDependencies = {
  correctionRepository,
  trainingRepository,
  trainingTriggerRepository,
  tutorialEvaluationRepository,
};

const dependencies = {
  fromDatasourceObject,
  tutorialRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
