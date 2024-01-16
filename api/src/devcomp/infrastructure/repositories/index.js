import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

import * as elementAnswerRepository from './element-answer-repository.js';
import * as moduleRepository from './module-repository.js';
import * as passageRepository from './passage-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as userRecommendedTrainingRepository from './user-recommended-training-repository.js';

import moduleDatasource from '../datasources/learning-content/module-datasource.js';

const repositoriesWithoutInjectedDependencies = {
  elementAnswerRepository,
  moduleRepository,
  passageRepository,
  trainingRepository,
  trainingTriggerRepository,
  userRecommendedTrainingRepository,
};

const dependencies = {
  moduleDatasource,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
