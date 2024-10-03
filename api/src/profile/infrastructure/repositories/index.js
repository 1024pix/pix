import * as usersApi from '../../../../src/identity-access-management/application/api/users-api.js';
import { injectDependencies } from '../../../../src/shared/infrastructure/utils/dependency-injection.js';
import * as userRepository from './user-repository.js';

const repositoriesWithoutInjectedDependencies = {
  userRepository,
};

const dependencies = {
  usersApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
