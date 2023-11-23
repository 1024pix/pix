import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as autonomousCourseRepository from './autonomous-course-repository.js';
import * as campaignApi from '../../../prescription/campaigns/application/api/campaigns-api.js';

const repositoriesWithoutInjectedDependencies = {
  autonomousCourseRepository,
};

const dependencies = {
  campaignApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
