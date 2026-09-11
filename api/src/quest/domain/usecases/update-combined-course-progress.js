import { COMBINED_COURSE_ITEM_TYPES } from '../constants.js';
import { OrganizationLearnerParticipation } from '../models/combined-course-participations/entities/OrganizationLearnerParticipation.js';

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

  // POC: a nested course is not visited any more, so it never gets a participation of
  // its own nor a reassessment. The parent cascades into its children BEFORE computing
  // its own items, otherwise it would read their previous state.
  const parentParticipation = await combinedCourseParticipationRepository.findByLearnerId({
    organizationLearnerId,
    combinedCourseId: combinedCourse.id,
  });

  if (parentParticipation) {
    for (const childCombinedCourseId of combinedCourseDetails.childCombinedCourseIds) {
      const child = await combinedCourseRepository.getById({ id: childCombinedCourseId });
      await combinedCourseParticipationRepository.save({
        organizationLearnerId,
        combinedCourseId: childCombinedCourseId,
      });
      await updateCombinedCourseProgress({
        userId,
        code: child.code,
        combinedCourseRepository,
        combinedCourseParticipationRepository,
        organizationLearnerPrescriptionRepository,
        organizationLearnerParticipationRepository,
        combinedCourseDetailsService,
        profileRewardRepository,
        successRepository,
      });
    }
  }

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
