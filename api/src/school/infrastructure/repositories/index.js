import * as organizationLearnerApi from '../../../prescription/organization-learner/application/api/organization-learners-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as missionLearnerRepository from '../../infrastructure/repositories/mission-learner-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as schoolRepository from '../../infrastructure/repositories/school-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationLearnerRepository,
  missionLearnerRepository,
  schoolRepository,
};

const dependencies = {
  organizationLearnerApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
