import * as trainingRepository from '../../../src/devcomp/infrastructure/repositories/training-repository.js';
import * as trainingTriggerRepository from '../../../src/devcomp/infrastructure/repositories/training-trigger-repository.js';
import * as tutorialEvaluationRepository from '../../../src/devcomp/infrastructure/repositories/tutorial-evaluation-repository.js';
import * as tutorialRepository from '../../../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as userRecommendedTrainingRepository from '../../../src/devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import { getCorrection } from '../../../src/evaluation/domain/services/solution/solution-service-qrocm-dep.js';
import * as frameworksApi from '../../../src/learning-content/application/api/frameworks-api.js';
import { fromDatasourceObject } from '../../../src/shared/infrastructure/adapters/solution-adapter.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import * as correctionRepository from './correction-repository.js';
import * as learningContentRepository from './learning-content-repository.js';

const repositoriesWithoutInjectedDependencies = {
  correctionRepository,
  trainingRepository,
  trainingTriggerRepository,
  tutorialEvaluationRepository,
  tutorialRepository,
  userRecommendedTrainingRepository,
  learningContentRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationApi} ComplementaryCertificationApi
 */
const dependencies = {
  fromDatasourceObject,
  getCorrection,
  tutorialRepository,
  frameworksApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
