import * as organizationFeatureAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as campaignParticipantRepository from './campaign-participant-repository.js';

const repositoriesWithoutInjectedDependencies = {
  campaignParticipantRepository,
};

const dependencies = {
  organizationFeatureAPI,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
