import { OrganizationLearnerParticipation } from '../models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../models/combined-course-participations/value-objects/CombinedCourseItem.js';

export async function updateCombinedCourseProgress({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseParticipationRepository,
  organizationLearnerPrescriptionRepository,
  organizationLearnerParticipationRepository,
  combinedCourseDetailsService,
  profileRewardRepository,
  successRepository,
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
    const success = await successRepository.find({
      userId,
      campaignParticipationIds: updatedCombinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(
        updatedCombinedCourseDetails.dataForQuest,
      ),
      targetProfileIds:
        updatedCombinedCourseDetails.quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(
          updatedCombinedCourseDetails.dataForQuest,
        ),
    });
    updatedCombinedCourseDetails.dataForQuest.success = success;
    updatedCombinedCourseDetails.participation.complete();
    const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromCombinedCourse(
      updatedCombinedCourseDetails.participation,
    );
    await combinedCourseParticipationRepository.update(organizationLearnerParticipation.fieldsForUpdate);

    if (updatedCombinedCourseDetails.isSuccessful() && combinedCourse.quest.rewardId) {
      await profileRewardRepository.reward({
        userId,
        rewardId: combinedCourse.quest.rewardId,
        organizationId: combinedCourse.organizationId,
      });
    }
  }

  return updatedCombinedCourseDetails.participation;
}
