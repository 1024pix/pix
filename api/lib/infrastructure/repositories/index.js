import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';

import * as correctionRepository from './correction-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import * as tutorialRepository from './tutorial-repository.js';
import * as userRecommendedTrainingRepository from './user-recommended-training-repository.js';

import { fromDatasourceObject } from '../adapters/solution-adapter.js';
import { getCorrection } from '../../domain/services/solution-service-qrocm-dep.js';

const repositoriesWithoutInjectedDependencies = {
  correctionRepository,
  trainingRepository,
  trainingTriggerRepository,
  tutorialEvaluationRepository,
  tutorialRepository,
  userRecommendedTrainingRepository,
};

const dependencies = {
  fromDatasourceObject,
  getCorrection,
  tutorialRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
