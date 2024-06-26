import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationApi from '../../../../team/application/api/organization.js';
import * as organizationMembershipRepository from './organization-membership-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationMembershipRepository,
};

const dependencies = {
  organizationApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
