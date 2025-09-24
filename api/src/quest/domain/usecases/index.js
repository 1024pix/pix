import * as codeGenerator from '../../../shared/domain/services/code-generator.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { repositories } from '../../infrastructure/repositories/index.js';

const dependencies = {
  accessCodeRepository: repositories.accessCodeRepository,
  eligibilityRepository: repositories.eligibilityRepository,
  rewardRepository: repositories.rewardRepository,
  successRepository: repositories.successRepository,
  questRepository: repositories.questRepository,
  combinedCourseParticipationRepository: repositories.combinedCourseParticipationRepository,
  combinedCourseParticipantRepository: repositories.combinedCourseParticipantRepository,
  combinedCourseRepository: repositories.combinedCourseRepository,
  moduleRepository: repositories.moduleRepository,
  recommendedModulesRepository: repositories.recommendedModulesRepository,
  campaignRepository: repositories.campaignRepository,
  userRepository: repositories.userRepository,
  targetProfileRepository: repositories.targetProfileRepository,
  codeGenerator,
  logger,
};

import { checkUserQuest } from './check-user-quest-success.js';
import { createCombinedCourses } from './create-combined-courses.js';
import { createOrUpdateQuestsInBatch } from './create-or-update-quests-in-batch.js';
import { findCombinedCourseByCampaignId } from './find-combined-course-by-campaign-id.js';
import { getCombinedCourseByCode } from './get-combined-course-by-code.js';
import getCombinedCourseByQuestId from './get-combined-course-by-quest-id.js';
import { getQuestResultsForCampaignParticipation } from './get-quest-results-for-campaign-participation.js';
import { getVerifiedCode } from './get-verified-code.js';
import { rewardUser } from './reward-user.js';
import { startCombinedCourse } from './start-combined-course.js';
import { updateCombinedCourse } from './update-combined-course.js';

const usecasesWithoutInjectedDependencies = {
  checkUserQuest,
  createOrUpdateQuestsInBatch,
  findCombinedCourseByCampaignId,
  getCombinedCourseByCode,
  getCombinedCourseByQuestId,
  getQuestResultsForCampaignParticipation,
  getVerifiedCode,
  rewardUser,
  startCombinedCourse,
  updateCombinedCourse,
  createCombinedCourses,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
