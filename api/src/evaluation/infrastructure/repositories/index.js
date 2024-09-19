import * as userApi from '../../../identity-access-management/application/api/users-api.js';
import * as campaignApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as targetProfileApi from '../../../prescription/target-profile/application/api/target-profile-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as autonomousCourseRepository from './autonomous-course-repository.js';
import * as autonomousCourseTargetProfileRepository from './autonomous-course-target-profile-repository.js';
import * as badgeCriteriaRepository from './badge-criteria-repository.js';
import * as userRepository from './user-repository.js';

const repositoriesWithoutInjectedDependencies = {
  autonomousCourseRepository,
  autonomousCourseTargetProfileRepository,
  badgeCriteriaRepository,
  userRepository,
};

const dependencies = {
  campaignApi,
  targetProfileApi,
  userApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
