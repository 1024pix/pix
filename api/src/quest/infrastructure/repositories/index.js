import * as knowledgeElementsApi from '../../../evaluation/application/api/knowledge-elements-api.js';
import * as organizationLearnerWithParticipationApi from '../../../prescription/organization-learner/application/api/organization-learners-with-participations-api.js';
import * as profileRewardApi from '../../../profile/application/api/profile-reward-api.js';
import * as rewardApi from '../../../profile/application/api/reward-api.js';
import { temporaryStorage } from '../../../shared/infrastructure/temporary-storage/index.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as eligibilityRepository from './eligibility-repository.js';
import * as rewardRepository from './reward-repository.js';
import * as successRepository from './success-repository.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

const repositoriesWithoutInjectedDependencies = {
  eligibilityRepository,
  successRepository,
  rewardRepository,
};

const dependencies = {
  organizationLearnerWithParticipationApi,
  knowledgeElementsApi,
  profileRewardApi,
  profileRewardTemporaryStorage,
  rewardApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
