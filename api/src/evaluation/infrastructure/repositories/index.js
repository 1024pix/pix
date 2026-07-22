import * as certificationEvaluationApi from '../../../certification/evaluation/application/api/certification-evaluation-api.js';
import * as tutorialRepository from '../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import * as userApi from '../../../identity-access-management/application/api/users-api.js';
import * as campaignApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as targetProfileApi from '../../../prescription/target-profile/application/api/target-profile-api.js';
import { fromDatasourceObject } from '../../../shared/infrastructure/adapters/solution-adapter.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { getCorrection } from '../../domain/services/solution/solution-service-qrocm-dep.js';
import * as autonomousCourseRepository from './autonomous-course-repository.js';
import * as autonomousCourseTargetProfileRepository from './autonomous-course-target-profile-repository.js';
import * as badgeCriteriaRepository from './badge-criteria-repository.js';
import * as certificationEvaluationRepository from './certification-evaluation-repository.js';
import * as correctionRepository from './correction-repository.js';
import * as userRepository from './user-repository.js';

const repositoriesWithoutInjectedDependencies = {
  certificationEvaluationRepository,
  autonomousCourseRepository,
  autonomousCourseTargetProfileRepository,
  badgeCriteriaRepository,
  userRepository,
  correctionRepository,
};

const dependencies = {
  campaignApi,
  targetProfileApi,
  userApi,
  tutorialRepository,
  fromDatasourceObject,
  getCorrection,
  certificationEvaluationApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
