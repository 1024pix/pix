import { COMBINED_COURSE_ITEM_TYPES } from '../models/combined-course-participation/CombinedCourseItem.js';
import { OrganizationLearnerParticipation } from '../models/OrganizationLearnerParticipation.js';

export async function updateCombinedCourseProgress({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseParticipationRepository,
  organizationLearnerPrescriptionRepository,
  organizationLearnerParticipationRepository,
  combinedCourseDetailsService,
  rewardRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const organizationLearnerId = await organizationLearnerPrescriptionRepository.findIdByUserIdAndOrganizationId({
    userId,
    organizationId: combinedCourse.organizationId,
  });

  const combinedCourseDetails = await combinedCourseDetailsService.instantiateCombinedCourseDetails({
    combinedCourseId: combinedCourse.id,
  });

  const combinedCourseDetailsBeforeUpdate = await combinedCourseDetailsService.getCombinedCourseDetails({
    organizationLearnerId,
    combinedCourseDetails,
  });

  if (!combinedCourseDetailsBeforeUpdate.hasParticipation) {
    return null;
  }

  const moduleToSynchronizeIds = combinedCourseDetailsBeforeUpdate.items
    .filter((item) => item.type === COMBINED_COURSE_ITEM_TYPES.MODULE)
    .map((item) => item.id);

  const updatedPassages = await organizationLearnerParticipationRepository.synchronize({
    organizationLearnerId,
    moduleIds: moduleToSynchronizeIds,
  });

  const updatedCombinedCourseDetails = combinedCourseDetailsBeforeUpdate.updateItemsFromPassages(updatedPassages);

  const isCombinedCourseCompleted = await updatedCombinedCourseDetails.items.every((item) => item.isCompleted);

  if (isCombinedCourseCompleted) {
    updatedCombinedCourseDetails.participation.complete();
    const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromCombinedCourse(
      updatedCombinedCourseDetails.participation,
    );
    await combinedCourseParticipationRepository.update(organizationLearnerParticipation.fieldsForUpdate);
    if (updatedCombinedCourseDetails.isSuccessful()) {
      await rewardRepository.reward({
        userId,
        rewardId: combinedCourse.quest.rewardId,
        rewardType: combinedCourse.quest.rewardType,
      });
    }
  }

  return updatedCombinedCourseDetails.participation;
}
