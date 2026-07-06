import * as organizationApi from '../../../../organizational-entities/application/api/organization-api.js';
import * as attestationsApi from '../../../../profile/application/api/attestations-api.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as organizationLearnerRepository from './organization-learner-repository.js';
import * as organizationToJoinRepository from './organization-to-join-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationLearnerRepository,
  organizationToJoinRepository,
};

const dependencies = {
  attestationsApi,
  organizationApi,
  organizationLearnerImportFormatRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
