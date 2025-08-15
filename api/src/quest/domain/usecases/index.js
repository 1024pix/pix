import { checkUserQuest } from './check-user-quest-success.js';
import { createOrUpdateQuestsInBatch } from './create-or-update-quests-in-batch.js';
import { getCombinedCourseByCode } from './get-combined-course-by-code.js';
import { getQuestResultsForCampaignParticipation } from './get-quest-results-for-campaign-participation.js';
import { getVerifiedCode } from './get-verified-code.js';
import { rewardUser } from './reward-user.js';
import { startCombinedCourse } from './start-combined-course.js';
import { updateCombinedCourse } from './update-combined-course.js';

const usecases = {
  checkUserQuest,
  createOrUpdateQuestsInBatch,
  getCombinedCourseByCode,
  getQuestResultsForCampaignParticipation,
  getVerifiedCode,
  rewardUser,
  startCombinedCourse,
  updateCombinedCourse,
};

export { usecases };
