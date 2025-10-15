import { COMBINED_COURSE_ITEM_TYPES } from '../models/CombinedCourseItem.js';

export async function updateCombinedCourse({
  userId,
  code,
  combinedCourseRepository,
  combinedCourseParticipationRepository,
  organizationLearnerPassageParticipationRepository,
  combinedCourseDetailsService,
}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const combinedCourseDetails = await combinedCourseDetailsService.getCombinedCourseDetails({
    userId,
    combinedCourseId: combinedCourse.id,
  });

  const moduleToSynchronizeIds = combinedCourseDetails.items
    .filter((item) => item.type === COMBINED_COURSE_ITEM_TYPES.MODULE)
    .map((item) => item.id);

  if (!combinedCourseDetails.participation) {
    return null;
  }

  await organizationLearnerPassageParticipationRepository.synchronize({
    organizationLearnerId: combinedCourseDetails.participation.organizationLearnerId,
    moduleIds: moduleToSynchronizeIds,
  });

  const isCombinedCourseCompleted = await combinedCourseDetails.items.every((item) => item.isCompleted);

  if (isCombinedCourseCompleted) {
    combinedCourseDetails.participation.complete();
    return combinedCourseParticipationRepository.update({
      combinedCourseParticipation: combinedCourseDetails.participation,
    });
  }

  return combinedCourseDetails.participation;
}
