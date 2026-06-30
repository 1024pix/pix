import * as organizationLearnerPrescriptionRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as codeGenerator from '../../../shared/domain/services/code-generator.js';
import * as membershipRepository from '../../../shared/infrastructure/repositories/membership-repository.js';
import * as organizationFeatureRepository from '../../../shared/infrastructure/repositories/organization-feature-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import * as combinedCourseBlueprintRepository from '../../infrastructure/repositories/combined-course-blueprint-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import combinedCourseDetailsService from '../services/combined-course-details-service.js';

const { combinedCourseDetailsService: injectedCombinedCourseDetailsService } = injectDependencies(
  { combinedCourseDetailsService },
  {
    combinedCourseParticipationRepository: repositories.combinedCourseParticipationRepository,
    combinedCourseRepository: repositories.combinedCourseRepository,
    campaignRepository: repositories.campaignRepository,
    questRepository: repositories.questRepository,
    moduleRepository: repositories.moduleRepository,
    eligibilityRepository: repositories.eligibilityRepository,
    recommendedModuleRepository: repositories.recommendedModuleRepository,
  },
);

const dependencies = {
  accessCodeRepository: repositories.accessCodeRepository,
  attestationRepository: repositories.attestationRepository,
  eligibilityRepository: repositories.eligibilityRepository,
  rewardRepository: repositories.rewardRepository,
  successRepository: repositories.successRepository,
  questRepository: repositories.questRepository,
  combinedCourseParticipationRepository: repositories.combinedCourseParticipationRepository,
  combinedCourseParticipantRepository: repositories.combinedCourseParticipantRepository,
  combinedCourseRepository: repositories.combinedCourseRepository,
  membershipRepository,
  moduleRepository: repositories.moduleRepository,
  recommendedModuleRepository: repositories.recommendedModuleRepository,
  campaignRepository: repositories.campaignRepository,
  userRepository: repositories.userRepository,
  targetProfileRepository: repositories.targetProfileRepository,
  organizationLearnerParticipationRepository: repositories.organizationLearnerParticipationRepository,
  combinedCourseDetailsService: injectedCombinedCourseDetailsService,
  organizationFeatureRepository,
  organizationLearnerRepository,
  organizationLearnerPrescriptionRepository,
  combinedCourseBlueprintRepository,
  courseRepository: repositories.courseRepository,
  campaignParticipationRepository: repositories.campaignParticipationRepository,
  profileRewardRepository: repositories.profileRewardRepository,
  combinedCourseBlueprintShareRepository: repositories.combinedCourseBlueprintShareRepository,
  codeGenerator,
  logger,
};

import { attachOrganizationsToCombinedCourseBlueprint } from './attach-organizations-to-combined-course-blueprint.js';
import { canManageCombinedCourse } from './can-manage-combined-course.js';
import { checkUserQuest } from './check-user-quest-success.js';
import { createAttestation } from './create-attestation.js';
import { createCombinedCourse } from './create-combined-course.js';
import { createCombinedCourseBlueprint } from './create-combined-course-blueprint.js';
import { createCombinedCourses } from './create-combined-courses.js';
import { createOrUpdateQuestsInBatch } from './create-or-update-quests-in-batch.js';
import { deleteAndAnonymizeParticipationsForALearnerId } from './delete-and-anonymise-participations-for-a-learner-id.js';
import { deleteAndAnonymizeCombinedCourses } from './delete-and-anonymize-combined-courses.js';
import { detachOrganizationFromCombinedCourseBlueprint } from './detach-organization-from-combined-course-blueprint.js';
import { findByOrganizationId } from './find-by-organization-id.js';
import { findCombinedCourseBlueprintById } from './find-combined-course-blueprint-by-id.js';
import { findCombinedCourseBlueprints } from './find-combined-course-blueprints.js';
import { findCombinedCourseByCampaignId } from './find-combined-course-by-campaign-id.js';
import { findCombinedCourseByModuleIdAndUserId } from './find-combined-course-by-moduleId-and-user-id.js';
import { findCombinedCourseParticipations } from './find-combined-course-participations.js';
import { getCombinedCourseBlueprintById } from './get-combined-course-blueprint-by-id.js';
import { getCombinedCourseByCode } from './get-combined-course-by-code.js';
import getCombinedCourseById from './get-combined-course-by-id.js';
import { getCombinedCourseParticipationById } from './get-combined-course-participation-by-id.js';
import { getCombinedCourseStatistics } from './get-combined-course-statistics.js';
import getCombinedCoursesByOrganizationId from './get-combined-courses-by-organization-id.js';
import { getCourseByOrganizationId } from './get-course-by-organization-id.js';
import { getOrganizationAttestations } from './get-organization-attestations.js';
import { getQuestResultsForCampaignParticipation } from './get-quest-results-for-campaign-participation.js';
import { getVerifiedCode } from './get-verified-code.js';
import { hasAccessToCombinedCourse } from './has-access-to-combined-course.js';
import { isCombinedCourseBlueprintInOrganization } from './is-combined-course-blueprint-in-organization.js';
import { isParticipationOnCombinedCourse } from './is-participation-on-combined-course.js';
import { rewardUser } from './reward-user.js';
import { startCombinedCourse } from './start-combined-course.js';
import { updateCombinedCourseBlueprint } from './update-combined-course-blueprint.js';
import { updateCombinedCourseProgress } from './update-combined-course-progress.js';
import { updateCombinedCourses } from './update-combined-courses.js';

const usecasesWithoutInjectedDependencies = {
  attachOrganizationsToCombinedCourseBlueprint,
  canManageCombinedCourse,
  checkUserQuest,
  createOrUpdateQuestsInBatch,
  detachOrganizationFromCombinedCourseBlueprint,
  deleteAndAnonymizeCombinedCourses,
  findCombinedCourseByCampaignId,
  findCombinedCourseByModuleIdAndUserId,
  getCombinedCourseByCode,
  getCombinedCourseStatistics,
  getCombinedCourseById,
  getCombinedCourseParticipationById,
  findCombinedCourseBlueprintById,
  findCombinedCourseParticipations,
  findCombinedCourseBlueprints,
  getCombinedCoursesByOrganizationId,
  getCombinedCourseBlueprintById,
  getQuestResultsForCampaignParticipation,
  getVerifiedCode,
  hasAccessToCombinedCourse,
  rewardUser,
  startCombinedCourse,
  updateCombinedCourseProgress,
  createAttestation,
  createCombinedCourses,
  createCombinedCourseBlueprint,
  updateCombinedCourseBlueprint,
  createCombinedCourse,
  findByOrganizationId,
  deleteAndAnonymizeParticipationsForALearnerId,
  updateCombinedCourses,
  getOrganizationAttestations,
  getCourseByOrganizationId,
  isParticipationOnCombinedCourse,
  isCombinedCourseBlueprintInOrganization,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
