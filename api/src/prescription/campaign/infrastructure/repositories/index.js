import * as organizationFeatureAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationApi from '../../../../team/application/api/organization.js';
import * as targetProfileApi from '../../../target-profile/application/api/target-profile-api.js';
import * as campaignToJoinRepository from './campaign-to-join-repository.js';
import * as organizationMembershipRepository from './organization-membership-repository.js';
import * as targetProfileRepository from './target-profile-repository.js';

const repositoriesWithoutInjectedDependencies = {
  campaignToJoinRepository,
  organizationMembershipRepository,
  targetProfileRepository,
};

const dependencies = {
  organizationApi,
  organizationFeatureAPI,
  targetProfileApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
