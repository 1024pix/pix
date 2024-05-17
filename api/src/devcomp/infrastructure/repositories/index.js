import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import moduleDatasource from '../datasources/learning-content/module-datasource.js';
import * as elementAnswerRepository from './element-answer-repository.js';
import * as elementRepository from './element-repository.js';
import * as moduleRepository from './module-repository.js';
import * as passageRepository from './passage-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import * as tutorialRepository from './tutorial-repository.js';
import * as userRecommendedTrainingRepository from './user-recommended-training-repository.js';
import * as userSavedTutorialRepository from './user-saved-tutorial-repository.js';

const repositoriesWithoutInjectedDependencies = {
  elementAnswerRepository,
  elementRepository,
  moduleRepository,
  passageRepository,
  trainingRepository,
  trainingTriggerRepository,
  userRecommendedTrainingRepository,
  userSavedTutorialRepository,
  tutorialRepository,
  tutorialEvaluationRepository,
};

const dependencies = {
  moduleDatasource,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
