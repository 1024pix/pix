import * as modulesApi from '../../../devcomp/application/api/modules-api.js';
import * as recommendedModulesApi from '../../../devcomp/application/api/recommended-modules-api.js';
import * as knowledgeElementsApi from '../../../evaluation/application/api/knowledge-elements-api.js';
import * as userApi from '../../../identity-access-management/application/api/users-api.js';
import * as skillsApi from '../../../learning-content/application/api/skills-api.js';
import * as campaignsApi from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as campaignParticipationsApi from '../../../prescription/campaign-participation/application/api/campaign-participations-api.js';
import * as organizationLearnerApi from '../../../prescription/organization-learner/application/api/organization-learners-api.js';
import * as organizationLearnerWithParticipationApi from '../../../prescription/organization-learner/application/api/organization-learners-with-participations-api.js';
import * as targetProfilesApi from '../../../prescription/target-profile/application/api/target-profile-api.js';
import * as profileRewardApi from '../../../profile/application/api/profile-reward-api.js';
import * as rewardApi from '../../../profile/application/api/reward-api.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import * as accessCodeRepository from '../../../shared/infrastructure/repositories/access-code-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { AttestationStorage } from '../storage/attestation-storage.js';
import * as attestationRepository from './attestation-repository.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';
import * as combinedCourseBlueprintShareRepository from './combined-course-blueprint-share-repository.js';
import * as targetProfileRepository from './combined-course-blueprints/target-profile-repository.js';
import * as combinedCourseDetailsRepository from './combined-course-details-repository.js';
import * as combinedCourseParticipantRepository from './combined-course-participant-repository.js';
import * as combinedCourseParticipationRepository from './combined-course-participations/combined-course-participation-repository.js';
import * as organizationLearnerParticipationRepository from './combined-course-participations/organization-learner-participation-repository.js';
import * as campaignRepository from './combined-courses/campaign-repository.js';
import * as combinedCourseRepository from './combined-courses/combined-course-repository.js';
import * as moduleRepository from './combined-courses/module-repository.js';
import * as courseRepository from './course-repository.js';
import * as eligibilityRepository from './eligibility-repository.js';
import * as profileRewardRepository from './profile-reward-repository.js';
import * as questRepository from './quest-repository.js';
import * as recommendedModuleRepository from './recommended-module-repository.js';
import * as rewardRepository from './reward-repository.js';
import * as successRepository from './success-repository.js';
import * as userRepository from './user-repository.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

const repositoriesWithoutInjectedDependencies = {
  accessCodeRepository,
  eligibilityRepository,
  organizationLearnerParticipationRepository,
  moduleRepository,
  successRepository,
  rewardRepository,
  questRepository,
  campaignRepository,
  combinedCourseRepository,
  courseRepository,
  combinedCourseBlueprintShareRepository,
  combinedCourseDetailsRepository,
  combinedCourseParticipantRepository,
  combinedCourseParticipationRepository,
  userRepository,
  recommendedModuleRepository,
  targetProfileRepository,
  campaignParticipationRepository,
  attestationRepository,
  profileRewardRepository,
};

const dependencies = {
  organizationLearnerWithParticipationApi,
  knowledgeElementsApi,
  campaignsApi,
  campaignParticipationsApi,
  organizationLearnerApi,
  skillsApi,
  profileRewardApi,
  modulesApi,
  targetProfilesApi,
  profileRewardTemporaryStorage,
  rewardApi,
  userApi,
  recommendedModulesApi,
  attestationStorage: AttestationStorage.createClient(),
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
