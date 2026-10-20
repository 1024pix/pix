import * as usersApi from '../../../../src/identity-access-management/application/api/users-api.js';
import { injectDependencies } from '../../../../src/shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as attestationRepository from './attestation-repository.js';
import * as userRepository from './user-repository.js';

const repositoriesWithoutInjectedDependencies = {
  userRepository,
  attestationRepository,
};

const dependencies = {
  usersApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
