import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CombinedCourseDetails } from '../../domain/models/combined-course-participation/CombinedCourseDetails.js';
import { Quest } from '../../domain/models/Quest.js';

const findByOrganizationId = async ({ organizationId }) => {
  const knexConn = DomainTransaction.getConnection();

  const combinedCourses = await knexConn('combined_courses')
    .select('combined_courses.*', 'quests.successRequirements', 'quests.rewardType', 'quests.rewardId')
    .join('quests', 'combined_courses.questId', 'quests.id')
    .where('combined_courses.organizationId', organizationId);

  return combinedCourses.map((combinedCourse) => {
    const quest = new Quest({
      id: combinedCourse.questId,
      successRequirements: combinedCourse.successRequirements,
      eligibilityRequirements: [],
      rewardId: combinedCourse.rewardId,
      rewardType: combinedCourse.rewardType,
    });
    return new CombinedCourseDetails(combinedCourse, quest);
  });
};

export { findByOrganizationId };
