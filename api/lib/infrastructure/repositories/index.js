import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';

import * as correctionRepository from './correction-repository.js';
import * as trainingRepository from './training-repository.js';
import * as trainingTriggerRepository from './training-trigger-repository.js';
import * as tutorialEvaluationRepository from './tutorial-evaluation-repository.js';
import * as tutorialRepository from './tutorial-repository.js';
import * as userRecommendedTrainingRepository from './user-recommended-training-repository.js';
import * as campaignParticipantRepository from './campaign-participant-repository.js';

import * as assessmentRepository from './assessment-repository.js';
import * as campaignRepository from './campaign-repository.js';
import * as competenceEvaluationRepository from './competence-evaluation-repository.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';

import { fromDatasourceObject } from '../adapters/solution-adapter.js';
import { getCorrection } from '../../domain/services/solution-service-qrocm-dep.js';

const repositoriesWithoutInjectedDependencies = {
  correctionRepository,
  trainingRepository,
  trainingTriggerRepository,
  tutorialEvaluationRepository,
  tutorialRepository,
  userRecommendedTrainingRepository,
  campaignParticipantRepository,
};

const dependencies = {
  fromDatasourceObject,
  getCorrection,
  tutorialRepository,
  assessmentRepository,
  campaignRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
