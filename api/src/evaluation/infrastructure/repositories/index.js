import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as autonomousCourseRepository from './autonomous-course-repository.js';
import * as campaignApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as autonomousCourseTargetProfileRepository from './autonomous-course-target-profile-repository.js';
import * as targetProfileApi from '../../../prescription/target-profile/application/api/target-profile-api.js';

const repositoriesWithoutInjectedDependencies = {
  autonomousCourseRepository,
  autonomousCourseTargetProfileRepository,
};

const dependencies = {
  campaignApi,
  targetProfileApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
