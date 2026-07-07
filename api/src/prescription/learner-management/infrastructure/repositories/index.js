import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as organizationFeatureRepository from './organization-feature-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationFeatureRepository,
};

const dependencies = {
  organizationFeatureApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
