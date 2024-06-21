import * as organizationFeatureAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationApi from '../../../../team/application/api/organization.js';
import * as campaignToJoinRepository from './campaign-to-join-repository.js';
import * as organizationMembershipRepository from './organization-membership-repository.js';

const repositoriesWithoutInjectedDependencies = {
  campaignToJoinRepository,
  organizationMembershipRepository,
};

const dependencies = {
  organizationApi,
  organizationFeatureAPI,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
