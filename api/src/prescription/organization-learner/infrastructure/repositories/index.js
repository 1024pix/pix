import * as attestationsApi from '../../../../profile/application/api/attestations-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationLearnerRepository from './organization-learner-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationLearnerRepository,
};

const dependencies = {
  attestationsApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
