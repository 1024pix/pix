import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import moduleDatasource from '../datasources/learning-content/module-datasource.js';
import * as elementAnswerRepository from './element-answer-repository.js';
import * as elementRepository from './element-repository.js';
import * as moduleMetadataRepository from './module-metadata-repository.js';
import * as moduleRepository from './module-repository.js';
import * as passageEventRepository from './passage-event-repository.js';
import * as passageRepository from './passage-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import * as tutorialRepository from './tutorial-repository.js';
import * as userCampaignSurveyRepository from './user-campaign-survey-repository.js';
import * as userRecommendedTrainingRepository from './user-recommended-training-repository.js';
import * as userSavedTutorialRepository from './user-saved-tutorial-repository.js';

const repositoriesWithoutInjectedDependencies = {
  elementAnswerRepository,
  elementRepository,
  moduleRepository,
  moduleMetadataRepository,
  passageEventRepository,
  passageRepository,
  trainingRepository,
  trainingTriggerRepository,
  userRecommendedTrainingRepository,
  userCampaignSurveyRepository,
  userSavedTutorialRepository,
  tutorialRepository,
  tutorialEvaluationRepository,
};

const dependencies = {
  moduleDatasource,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
